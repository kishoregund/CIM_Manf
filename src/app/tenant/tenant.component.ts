import { OnInit, Component, AfterViewInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { NotificationService, AccountService } from "../_services";
import { TenantService } from "../_services/tenant.service";
import { AppBasicService } from "../_services/AppBasic.service";

@Component({
  templateUrl: "./tenant.component.html"
})
export class TenantComponent implements OnInit, AfterViewInit {
  Form: FormGroup
  submitted: boolean
  @Input("companyId") companyId: any
  id: any;

  isNewMode: any;
  isEditMode: any;

  hasDeleteAccess: boolean = false;
  companyList: any;


  public modalRef: BsModalRef;
  public onClose: Subject<any>;
  @Input("isDialog") isDialog: boolean = false;
  formData: { [key: string]: any; };

  constructor(
    public activeModal: BsModalService,
    private tenantService: TenantService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private AccountService: AccountService,
    private appBasicService: AppBasicService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.onClose = new Subject();
//    this.hasDeleteAccess = this.AccountService.userValue.isAdmin;

    this.Form = this.formBuilder.group({
      name: ['', [Validators.required]],
      connectionString: ['', [Validators.required]],
      identifier: ['', [Validators.required]],
      adminEmail: ['', [Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$"), Validators.required]],
      validUpTo: ['', [Validators.required]],
      isActive: true,
      id: [""]
    });
    var id = this.activeRoute.snapshot.paramMap.get("id")
    this.isNewMode = id == null;

    let user = this.AccountService.userValue;
    //console.log(user);

    // this.Form.get('companyId').setValue(user.companyId);
    // this.Form.get('companyId').disable();

    if (id) {
      this.id = id;
      this.Form.get('id').setValue(id);

      var getByIdRequest: any = await this.tenantService.GetById(id).toPromise();
      debugger;
      this.formData = getByIdRequest.data;
      this.Form.patchValue(this.formData);
    }

  }

  ngAfterViewInit(): void {
    if (!this.isNewMode) {
      this.Form.disable();
    }

  }

  Back() {
    this.router.navigate(["/tenantlist"]);
  }


  EditMode() {
    if (!confirm("Are you sure you want to edit the record?")) return;

    this.isEditMode = true;
    this.Form.enable();
    //this.FormControlDisable();
    this.router.navigate(
      ["."],
      {
        relativeTo: this.activeRoute,
        queryParams: {
          isNSNav: false
        },
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
  }

  // DeleteRecord() {
  //   this.tenantService.Delete(this.id)
  //     .subscribe((data: any) => {
  //       if (data.isSuccessful) {
  //         this.notificationService.showSuccess("Deleted Successfully", "Success")
  //         this.router.navigate(["/tenantlist"], { queryParams: { isNSNav: true } })
  //       }
  //       else this.notificationService.showInfo(data.messages[0], "Error")
  //     })
  // }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.Form.patchValue(this.formData);
    else 
    {
      this.Form.reset();
    //this.Form.get("name").reset();
    }
    this.Form.disable()
    this.isEditMode = false;
    this.isNewMode = false;

    this.notificationService.SetNavParam();
  }

  //FormControlDisable() {
    // this.Form.get('companyId').disable();
    // this.Form.get('company').disable();
  //}

  async onSubmit() {
    this.submitted = true;
    this.Form.markAllAsTouched();

    if (this.Form.invalid) return;

    this.Form.enable();
    let formData = this.Form.value;
    //this.FormControlDisable();

    if (!this.id) {
      this.tenantService.Save(formData)
        .subscribe((data: any) => {
          var success = data.isSuccessful;
          if (success) {
            this.notificationService.showSuccess("Tenant created successfully!", "Success")
            this.router.navigate(["/tenantlist"],
              {
                queryParams: { isNSNav: true },
              });

          }
          else this.notificationService.showInfo(data.messages[0], "Info");
        })
    }

  }

  Upgrade()
  {
    let formData = this.Form.value;
    this.tenantService.Update({TenantId:this.id, NewExpiryDate:formData.validUpTo})
        .subscribe((data: any) => {
          if (data.isSuccessful) {           
            this.notificationService.showSuccess("Tenant upgraded successfully!", "Success")
            this.router.navigate(["/tenantlist"],
              {
                queryParams: { isNSNav: true },
              });
          }
          else this.notificationService.showInfo(data.messages[0], "Info");
        })
  }


  Activate()
  {
    let formData = this.Form.value;
    this.tenantService.Activate({TenantId:this.id})
        .subscribe((data: any) => {
          if (data.isSuccessful) {           
            this.notificationService.showSuccess("Tenant activated successfully!", "Success")
            this.router.navigate(["/tenantlist"],
              {
                queryParams: { isNSNav: true },
              });
          }
          else this.notificationService.showInfo(data.messages[0], "Info");
        })
  }

  Deactivate()
  {
    let formData = this.Form.value;
    this.tenantService.Deactivate({TenantId:this.id})
        .subscribe((data: any) => {
          if (data.isSuccessful) {           
            this.notificationService.showSuccess("Tenant deactivated successfully!", "Success")
            this.router.navigate(["/tenantlist"],
              {
                queryParams: { isNSNav: true },
              });
          }
          else this.notificationService.showInfo(data.messages[0], "Info");
        })
  }

  close(success) {
    this.onClose.next(success);
  }

  get f() {
    return this.Form.controls;
  }

}