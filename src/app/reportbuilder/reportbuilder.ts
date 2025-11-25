// reportbuilder.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DynamicQueryService } from '../_services/reportbuilder.service';

interface Screen {
  key: string;
  label: string;
  table: string;
  columns: ColumnMeta[];
}

interface ColumnMeta {
  key: string;
  label: string;
  name: string;              // DB column
  type: 'string' | 'number' | 'date' | 'boolean';
}

interface QueryFilter {
  screenKey: string;
  columnKey: string;
  operator: string;
  value?: any;
  valueStart?: any;
  valueEnd?: any;
  valueCsv?: string;
}

interface JoinSpec {
  leftScreen: string;
  leftColumn: string;
  rightScreen: string;
  rightColumn: string;
  type: 'INNER' | 'LEFT' | 'RIGHT';
}

interface DynamicQueryRequest {
  screens: string[];
  columns: { screenKey: string; columnKey: string }[];
  filters: { screenKey: string; columnKey: string; operator: string; value?: any }[];
  joins?: JoinSpec[];
  orderBy?: { screenKey: string; columnKey: string; direction: 'ASC'|'DESC' }[];
  limit?: number;
}

@Component({
    selector: 'app-reportbuilder',
    templateUrl: './reportbuilder.component.html',
    styleUrls: ['./reportbuilder.component.css'],
    standalone: false
})
export class DynamicQueryComponent implements OnInit {
  screensCtrl = new FormControl<string[]>([]);
  columnsCtrl = new FormControl<string[]>([]);

  screens: Screen[] = [
    {
      key: 'users', label: 'Users', table: 'dbo.Users',
      columns: [
        { key: 'id', label: 'ID', name: 'Id', type: 'number' },
        { key: 'name', label: 'Name', name: 'Name', type: 'string' },
        { key: 'email', label: 'Email', name: 'Email', type: 'string' },
        { key: 'createdAt', label: 'Created At', name: 'CreatedAt', type: 'date' },
        { key: 'isActive', label: 'Active', name: 'IsActive', type: 'boolean' },
      ]
    },
    {
      key: 'orders', label: 'Orders', table: 'dbo.Orders',
      columns: [
        { key: 'orderId', label: 'Order ID', name: 'OrderId', type: 'number' },
        { key: 'userId', label: 'User ID', name: 'UserId', type: 'number' },
        { key: 'amount', label: 'Amount', name: 'Amount', type: 'number' },
        { key: 'status', label: 'Status', name: 'Status', type: 'string' },
        { key: 'orderedAt', label: 'Ordered At', name: 'OrderedAt', type: 'date' },
      ]
    }
  ];

  operators = ['=', '!=', '>', '>=', '<', '<=', 'LIKE', 'IN', 'BETWEEN', 'IS NULL', 'IS NOT NULL'];
  filters: QueryFilter[] = [];

  availableColumns: { screenKey: string; screenLabel: string; columnKey: string; label: string }[] = [];

  orderByColumn?: string;
  orderByDirection: 'ASC' | 'DESC' = 'ASC';
  limit?: number;
  rows: any[] = [];

  constructor(private service: DynamicQueryService) {}

  ngOnInit() {
    this.screensCtrl.valueChanges.subscribe(() => this.refreshAvailableColumns());
    this.columnsCtrl.valueChanges.subscribe(() => this.updateSelectedColumnDefs());
  }

  get selectedScreens(): Screen[] {
    const keys = this.screensCtrl.value || [];
    return this.screens.filter(s => keys.includes(s.key));
  }

  columnsByScreen(screenKey: string) {
    return this.screens.find(s => s.key === screenKey)?.columns ?? [];
  }

  columnKey(c: { screenKey: string; columnKey: string }) {
    return `${c.screenKey}.${c.columnKey}`;
  }

  refreshAvailableColumns() {
    this.availableColumns = [];
    for (const s of this.selectedScreens) {
      for (const c of s.columns) {
        this.availableColumns.push({
          screenKey: s.key,
          screenLabel: s.label,
          columnKey: c.key,
          label: c.label
        });
      }
    }

    // prune filters if screen removed
    this.filters = this.filters.filter(f => this.selectedScreens.some(s => s.key === f.screenKey));

    // prune columns selection
    const valid = new Set(this.availableColumns.map(c => this.columnKey(c)));
    this.columnsCtrl.setValue((this.columnsCtrl.value || []).filter(k => valid.has(k)), { emitEvent: false });

    this.updateSelectedColumnDefs();
  }

  addFilter() {
    const firstScreen = this.selectedScreens[0]?.key;
    const firstCol = firstScreen ? this.columnsByScreen(firstScreen)[0]?.key : '';
    this.filters.push({ screenKey: firstScreen || '', columnKey: firstCol || '', operator: '=', value: '' });
  }

  removeFilter(i: number) {
    this.filters.splice(i, 1);
  }

  onFilterScreenChange(i: number) {
    const sk = this.filters[i].screenKey;
    this.filters[i].columnKey = this.columnsByScreen(sk)[0]?.key || '';
  }

  valueMode(operator: string) {
    if (operator === 'BETWEEN') return 'between';
    if (operator === 'IN') return 'in';
    if (operator === 'IS NULL' || operator === 'IS NOT NULL') return 'none';
    return 'single';
  }

  get selectedColumnDefs() {
    const keys = this.columnsCtrl.value || [];
    return keys.map(k => {
      const [sk, ck] = k.split('.');
      const screen = this.screens.find(s => s.key === sk)!;
      const col = screen.columns.find(c => c.key === ck)!;
      const alias = `${sk}_${ck}`;
      return {
        alias,
        header: `${screen.label} — ${col.label}`,
        screenKey: sk,
        columnKey: ck,
        table: screen.table,
        columnName: col.name
      };
    });
  }

  get selectedColumnAliases() {
    return this.selectedColumnDefs.map(c => c.alias);
  }

  buildRequest(): DynamicQueryRequest {
    const columns = this.selectedColumnDefs.map(c => ({ screenKey: c.screenKey, columnKey: c.columnKey }));

    const filters = this.filters.map(f => {
      const op = f.operator;
      let value = f.value;
      if (op === 'BETWEEN') value = [f.valueStart, f.valueEnd];
      if (op === 'IN') value = (f.valueCsv || '').split(',').map(x => x.trim()).filter(Boolean);
      return { screenKey: f.screenKey, columnKey: f.columnKey, operator: op, value };
    });

    // example join inference (customize to your schema)
    const joins: JoinSpec[] = [];
    const set = new Set(this.screensCtrl.value || []);
    if (set.has('users') && set.has('orders')) {
      joins.push({ leftScreen: 'users', leftColumn: 'id', rightScreen: 'orders', rightColumn: 'userId', type: 'INNER' });
    }

    let orderBy;
    if (this.orderByColumn) {
      const [sk, ck] = this.orderByColumn.split('.');
      orderBy = [{ screenKey: sk, columnKey: ck, direction: this.orderByDirection }];
    }

    return {
      screens: Array.from(set),
      columns,
      filters,
      joins,
      orderBy,
      limit: this.limit
    };
  }

  updateSelectedColumnDefs() {
    // no-op: getter recalculates; maintained for clarity
  }

  async runQuery() {
    const req = this.buildRequest();
    this.rows = await this.service.executeQuery(req);
  }
}
