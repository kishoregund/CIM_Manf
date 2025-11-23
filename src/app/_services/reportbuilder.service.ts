// dynamic-query.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DynamicQueryService {
  constructor(private http: HttpClient) {}

  executeQuery(req: any): Promise<any[]> {
    return this.http.post<any[]>('/api/dynamic-query/execute', req).toPromise();
  }
}
