import { Component, OnInit } from '@angular/core';

import {
  CustomerSite,
  InstrumentConfig,
  ListTypeItem,
  ResultMsg,
  SparePart,
  User
} from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  AlertService,
  ListTypeService,
  NotificationService
} from '../_services';
import { UserDetails } from '../_newmodels/UserDetails';
import { Role, RoleReadOnly } from '../_models/role';
import { RoleService } from '../_services/role.service';


@Component({
  selector: 'app-instrument',
  templateUrl: './role.html',
})
export class RoleComponent implements OnInit {
  user: UserDetails;
  roleform: FormGroup;
  role: Role;
  customersite: CustomerSite[];
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  code: string = "CONTY";
  listTypeItems: any;
  config: InstrumentConfig;
  sparePartDetails: SparePart[];
  selectedConfigType: string[] = [];
  imagePath: string;
  instuType: ListTypeItem[];
  permissions: FormArray;
  listT: any;
  rolePermission: RoleReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isCopy: boolean = false;
  isEditMode: boolean;
  isNewMode: boolean;
  privilagesList: any[];
  screensList: any[];
  lstScreens: any[] = [];
  lstCategory: any[];
  isNewSetup: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private roleService: RoleService,
  ) {
    notificationService.listen().subscribe((m) => {
      this.GetById();
    })

  }

  ngOnInit() {
    //debugger;
    this.user = this.accountService.userValue;
    this.rolePermission = this.roleService.userRoleValue;
    if (this.rolePermission != null) {
      let rolePermission = this.rolePermission.permissions.filter(x => x.screenCode == "PROF");
      if (rolePermission.length > 0) {
        this.hasReadAccess = rolePermission[0].read;
        this.hasAddAccess = rolePermission[0].create;
        this.hasDeleteAccess = rolePermission[0].delete;
        this.hasUpdateAccess = rolePermission[0].update;
      }
    }

    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }


    this.roleform = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      permissions: this.formBuilder.array([]),
      isactive: [true],
      isdeleted: [false],
      screenId: [],
      categoryId: [],
      create: false,
      read: false,
      update: false,
      delete: false,
      commercial: false,
      privilages: [""],
    });


    this.id = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe((data) => {
      this.isNewSetup = data.isNewSetUp != null && data.isNewSetUp != undefined;
    });

    this.listTypeService.getById("PVGLS")
      .pipe(first()).subscribe((data: any) => this.privilagesList = data.data)

    this.listTypeService.getById("PRGRP")
      .pipe(first()).subscribe((data: any) => this.lstCategory = data.data)


    this.roleService.GetAllScreens()
      .pipe(first())
      .subscribe((data: any) => {
        debugger;
        data.data.sort((a, b) => {
          var value = 0
          a.categoryName < b.categoryName ? value = -1 : a.categoryName > b.categoryName ? value = 1 : value = 0;
          return value;
        });
        this.screensList = data.data;

        if (this.id != null) {
          this.GetById();
          setTimeout(() => this.roleform.disable(), 500);
        }
        else {
          this.isNewMode = true
        }
      });
  }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.roleform.enable();

      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });

    }
  }

  Back() {
    this.router.navigate(["rolelist"]);
  }

  GetById() {
    this.roleService.getById(this.id)
      .pipe(first())
      .subscribe((roleData: any) => {
        this.roleform.get("name").setValue(roleData.data.name)
        this.roleform.get("description").setValue(roleData.data.description)
        roleData.data.permissions.forEach(x => {
          this.roleform.get("categoryId").setValue(x.category)
          this.onCategoryChange()
          this.roleform.get("screenId").setValue(x.screenId)
          this.roleform.get("create").setValue(x.create)
          this.roleform.get("read").setValue(x.read)
          this.roleform.get("update").setValue(x.update)
          this.roleform.get("delete").setValue(x.delete)
          this.roleform.get("commercial").setValue(x.commercial)
          this.roleform.get("privilages").setValue(x.privilages)
          if (!this.isCopy) {
            this.AddScreen(x.id)
          }
        });
      });
  }

  CancelEdit() {
    this.roleform.disable();
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.roleService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["rolelist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            })
          }
          else {
            this.notificationService.showInfo(data.messages[0], "Info");
          }
        })
    }
  }

  CopyRecord() {
    this.isCopy = true;
    this.GetById();
    this.id = null;
  }

  onCategoryChange() {
    let categoryId = this.roleform.get("categoryId").value;
    this.lstScreens = this.screensList.filter(x => x.category == categoryId)
    setTimeout(() => this.roleform.get("screenId").reset(), 500);
  }

  addItem(): void {
    this.listT = this.listTypeItems;

    this.permissions = this.roleform.get('permissions') as FormArray;
    this.permissions.push(this.formBuilder.group({
      id: this.listT.id == undefined || this.listT.id == null ? '' : this.listT.id,
      screenId: this.listT.screenId,
      screenName: this.listT.screenName,
      create: this.listT.create == undefined || this.listT.create == null ? false : this.listT.create,
      screenCode: this.listT.screenCode,
      read: this.listT.read == undefined || this.listT.read == null ? false : this.listT.read,
      categoryName: this.listT.categoryName,
      update: this.listT.update == undefined || this.listT.update == null ? false : this.listT.update,
      privilages: this.listT.privilages,
      delete: this.listT.delete == undefined || this.listT.delete == null ? false : this.listT.delete,
      commercial: this.listT.commercial == undefined || this.listT.commercial == null ? false : this.listT.commercial,
    }));

  }

  // convenience getter for easy access to form fields
  get f() { return this.roleform.controls; }
  get c() { return this.roleform.controls.Permissions; }

  getScreenCode() {
    let code = "";
    if (this.lstScreens.length > 0) code = this.lstScreens.find(x => x.screenId == this.roleform.get("screenId").value)?.screenCode;
    return code
  }
  getName(i) {
    return this.getControls()[i].value;
  }

  screenCode(i) {
    return this.getName(i).screenCode
  }

  AddScreen(id: string = "") {
    debugger
    let screnId = this.roleform.get("screenId")
    if (!screnId.value) return this.notificationService.showInfo("Select Screen", "Info");

    let array = (<FormArray>this.roleform.get("permissions")).value.findIndex(x => x.screenId == screnId.value)
    if (array != -1) {
      array=[];
      debugger;
      return this.notificationService.showInfo("This Screen Already Exists!", "Info");
    }

    let fcreate = this.roleform.get("create")
    let fread = this.roleform.get("read")
    let fdelete = this.roleform.get("delete")
    let fupdate = this.roleform.get("update")
    let fcommercial = this.roleform.get("commercial")
    let screen = this.lstScreens.find(x => x.screenId == screnId.value);
    let privilages = this.roleform.get("privilages");
    if (!privilages.value) return this.notificationService.showInfo("Select privilege", "Info");

    let obj = {
      id,
      screenId: screen?.screenId,
      screenName: screen?.screenName,
      screenCode: screen?.screenCode,
      categoryName: screen?.categoryName,
      privilages: privilages.value,
      create: fcreate.value,
      read: fread.value,
      delete: fdelete.value,
      update: fupdate.value,
      commercial: fcommercial.value,
    }

    this.roleform.get("categoryId").reset();
    screnId.reset();
    privilages.reset();
    fcreate.reset();
    fread.reset();
    fdelete.reset();
    fupdate.reset();
    fcommercial.reset();
    this.lstScreens = [];
    this.listTypeItems = obj
    this.addItem()
  }

  DeleteScreen(index) {
    (<FormArray>this.roleform.get("permissions")).removeAt(index);
  }
  getControls() {
    return (<FormArray>this.roleform.get('permissions')).controls;
  }

  SelectAll(property: string) {
    let permission = this.roleform.get('permissions') as FormArray;

    if (property == "commercial") {
      for (let i of permission.controls) {
        if (i.value.screenCode == "SINST" || i.value.screenCode == "OFREQ" || i.value.screenCode == "SAMC")
          i.get(property).setValue(!i.get(property).value)
      }
      return
    }

    let inp = document.getElementById('selectall' + property) as HTMLInputElement;

    for (var i of permission.controls) {
      inp.checked ? i.get(property).setValue(true) : i.get(property).setValue(false);
    }
  }

  onSubmit() {
    //debugger;
    this.submitted = true;
    this.roleform.markAllAsTouched();
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.roleform.invalid) return;

    this.isSave = true;
    this.loading = true;
    this.role = this.roleform.value;

    if (this.id == null) {
      debugger;
      let ppermissions = this.roleform.get('permissions') as FormArray;
      if (ppermissions.length <= 0) {
        this.notificationService.showInfo("Please add screen with permissions to proceed further.", "Info");
      }
      else {
        this.roleService.save(this.role)
          .pipe(first())
          .subscribe((data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.router.navigate(["rolelist"],
                {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });

            }
            else {
              this.notificationService.showInfo(data.messages[0], "Info");
            }
            this.loading = false;
            this.isCopy = false;
          });
      }
    }
    else {
      this.role.id = this.id;
      this.roleService.update(this.id, this.role)
        .pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess(data.messages[0], "Success");
            this.router.navigate(["rolelist"],
              {
                //relativeTo: this.activeRoute,
                queryParams: { isNSNav: true },
                //queryParamsHandling: 'merge'
              });
          }
          else {
            this.notificationService.showInfo(data.messages[0], "Info");
          }
          this.loading = false;
        });
    }
  }

}
