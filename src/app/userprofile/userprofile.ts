import { Component, OnInit } from '@angular/core';

import {
  CustomerSite,
  ListTypeItem,
  Profile,
  ProfileReadOnly,
  ProfileRegions,
  User,
  UserProfile
} from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  AlertService,
  ListTypeService,
  NotificationService,
  ProfileService,
  UserProfileService
} from '../_services';
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { EnvService } from '../_services/env/env.service';
import { BusinessUnitService } from '../_services/businessunit.service';
import { BrandService } from '../_services/brand.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { CustomerService } from '../_services/customer.service';
import { DistributorService } from '../_services/distributor.service';
import { RoleService } from '../_services/role.service';


@Component({
  selector: 'app-userp',
  templateUrl: './userprofile.html',
})
export class UserProfileComponent implements OnInit {
  user: UserDetails;
  userprofileform: FormGroup;
  roleList: any;// Profile[];
  customersite: CustomerSite[];
  userprofile: UserProfile;
  submitted = false;
  id: string;
  hidetable: boolean = false;
  listTypeItems: ListTypeItem[];
  segmentList: ListTypeItem[];
  profileRegions: FormArray;
  contactId: string;
  profileregion: ProfileRegions;
  profilewithregdata: ProfileRegions[];
  userList: User[];
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  isEng: boolean = false;
  isDist: boolean = false;
  regionList: any;
  dropdownSettings: IDropdownSettings = {};
  siteDropdownSettings: IDropdownSettings = {};
  isEditMode: boolean;
  isNewMode: boolean;
  siteList: any;
  isCustomer: any;
  businessUnitDropdownSettings: any;
  businessUnitList: any[];
  brandDropdownSettings: any;
  brandList: any[];
  isNewSetup: boolean;
  formData: any;
  contactType:string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private roleService: RoleService,
    private userService: AccountService,
    private userprofileService: UserProfileService,
    private profileService: ProfileService,
    private DistributorService: DistributorService,
    private customerService: CustomerService,
    private environment: EnvService,    
    private businessUnitService: BusinessUnitService,
    private brandService: BrandService
  ) { }

  ngOnInit() {
    this.dropdownSettings = {
      idField: 'id',
      textField: 'distRegName',
    };

    this.siteDropdownSettings = {
      idField: 'id',
      textField: 'custRegName',
    };

    this.businessUnitDropdownSettings = {
      idField: 'id',
      textField: 'businessUnitName',
    };

    this.brandDropdownSettings = {
      idField: 'id',
      textField: 'brandName',
    };

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "URPRF");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    this.userprofileform = this.formBuilder.group({
      userId: ['', Validators.required],
      designation: [''],
      segmentId: ['', Validators.required],
      profileForId: [''],
      distributorName: [''],
      roleId: ['', Validators.required],      
      distRegions: ['', Validators.required],
      custSites: [],
      isDeleted: [false],
      profileRegions: this.formBuilder.array([]),
      businessUnitIds: ["", Validators.required],
      brandIds: ["", Validators.required],
      description: ["", Validators.required]
    });

    this.listTypeService.getById("RF").pipe(first())
      .subscribe((data: any) => {
        this.listTypeItems = data.data;
        this.listTypeItems = this.listTypeItems.filter(item => item.itemName !== "Contact");
      });

    this.listTypeService.getById("SEGMENTS").pipe(first())
      .subscribe((data: any) => {
        debugger;
        this.segmentList = data.data.filter(x => x.itemCode != "RADM")
      });

    this.roleService.getAll().pipe(first())
      .subscribe((data: any) => this.roleList = data.data);

      this.userService.getAll().pipe(first())
      .subscribe((data: any) => this.userList = data.data);

    // this.userprofileService.getUserAll().pipe(first())
    //   .subscribe((data: any) => this.userList = data.data);

    this.businessUnitService.GetAll()
      .pipe(first()).subscribe((data: any) => this.businessUnitList = data.data)

    this.userprofileform.get("businessUnitIds")
      .valueChanges.subscribe((values: any) => {
        if (!values) return;
        var buIds = values.map(x => x.id).toString();
        this.brandService.GetByBUs(buIds)
          .pipe(first()).subscribe((data: any) => {
            var nBrand = [];
            var lstBrand: any[] = this.userprofileform.get("brandIds").value
            this.brandList = data.data;
            this.brandList.forEach(element => {
              var obj = lstBrand.find(x => x.id == element.id);
              if (obj) nBrand.push(obj);
            })
            this.userprofileform.get("brandIds").setValue(nBrand);
          })
      })

    this.id = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe((data) => {
      this.isNewSetup = data.isNewSetUp != null && data.isNewSetUp != undefined;
    });

    if (this.id != null) {
      this.userprofileService.getById(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          console.log(data);

          this.contactId = data.data.contactId;
          //let role = data.data.roleId;
          let role = data.data.segmentId;
          this.isCustomer = data.data.contactType.toLowerCase() == "cs";
          debugger;
          if (this.isCustomer) {
            this.userprofileform.get("custSites").setValidators([Validators.required])
            this.userprofileform.get("custSites").updateValueAndValidity();          

            this.userprofileService.getSitesByConId(data.data.contactId)
              .pipe(first()).subscribe((data: any) => {
                this.siteList = data.data;
              });
          }

          // this.customerService.getAllByConId(data.data.contactid)
          //   .pipe(first()).subscribe((data: any) => {
          //     this.siteList = data.data[0]?.sites
          //   })

          // this.listTypeService.getById("ROLES")
          //   .pipe(first()).subscribe({
          //     next: (data: ListTypeItem[]) => {
            debugger;
                switch (this.segmentList?.find(x => x.listTypeItemId == role)?.itemCode) {                  
                  case this.environment.engRoleCode:
                    this.isEng = true;
                    this.GetDistributorByContactId();
                    break;

                  case this.environment.distRoleCode:
                    this.isDist = true;
                    this.GetDistributorByContactId();
                    break;

                  case this.environment.custRoleCode:
                    this.isDist = false;
                    this.isEng = false;
                    this.userprofileform.get('distRegions').clearValidators()
                    this.userprofileform.get('distRegions').updateValueAndValidity()
                    this.userprofileform.get('businessUnitIds').clearValidators()
                    this.userprofileform.get('businessUnitIds').updateValueAndValidity()
                    this.userprofileform.get('brandIds').clearValidators()
                    this.userprofileform.get('brandIds').updateValueAndValidity()
                    break;
                }
            //   }
            // })

          var subreq = data.data.distRegions?.split(',');
          let items: any = [];
          if (subreq != null && subreq.length > 0) {
            for (var i = 0; i < subreq.length; i++) {
              let t = { id: subreq[i] }
              items.push(t);
            }
            this.userprofileform.patchValue({ "distRegions": items });
          }

          subreq = data.data.businessUnitIds?.split(',');
          items = [];
          if (subreq != null && subreq.length > 0) {
            for (var i = 0; i < subreq.length; i++) {
              let t = { id: subreq[i] }
              items.push(t);
            }
            this.userprofileform.patchValue({ "businessUnitIds": items });
          }

          subreq = data.data.brandIds?.split(',');
          items = [];
          if (subreq != null && subreq.length > 0) {
            for (var i = 0; i < subreq.length; i++) {
              let t = { id: subreq[i] }
              items.push(t);
            }
            this.userprofileform.patchValue({ "brandIds": items });
            // this.formData.brandId = items;
          }

          subreq = data.data.custSites?.split(',');
          items = [];
          if (subreq != null && subreq.length > 0) {
            for (var i = 0; i < subreq.length; i++) {
              let t = { id: subreq[i] }
              items.push(t);
            }
            this.userprofileform.patchValue({ "custSites": items });
          }

          this.userprofileform.patchValue({ "userId": data.data.userId });
          this.userprofileform.patchValue({ "designation": data.data.designation });
          //this.userprofileform.patchValue({ "profileId": data.data.profileId });
          this.userprofileform.patchValue({ "profileForId": data.data.profileForId });
          this.userprofileform.patchValue({ "distributorName": data.data.entityParentName });
          this.userprofileform.patchValue({ "roleId": data.data.roleId });
          this.userprofileform.patchValue({ "segmentId": data.data.segmentId });
          this.userprofileform.patchValue({ "isdeleted": data.data.isdeleted });
          this.userprofileform.patchValue({ "description": data.data.description });

          if (data.data.profileRegions != null) {
            this.userprofileform.patchValue({ "profileRegions": data.data.profileRegions });
            this.profilewithregdata = data.data.profileRegions;
          }

          this.onprofileClick(data.data.profileForId);

        });

      setTimeout(() => {
        this.userprofileform.enable();
        this.formData = this.userprofileform.value;
        this.userprofileform.disable();
      }, 100);
    }
    else {
      this.isNewMode = true
    }
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.userprofileform.enable();

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
    this.router.navigate(["userprofilelist"]);
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.userprofileform.patchValue(this.formData);
    else this.userprofileform.reset();
    this.userprofileform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  //DeleteRecord() {
    // if (confirm("Are you sure you want to delete the record?")) {

    //   this.userprofileService.delete(this.id).pipe(first())
    //     .subscribe((data: any) => {
    //       if (data.isSuccessful)
    //         this.router.navigate(["userprofilelist"], {
    //           //relativeTo: this.activeRoute,
    //           queryParams: { isNSNav: true },
    //           //queryParamsHandling: 'merge'
    //         })
    //     })
    // }
  //}

  onSegmentChange(segment: string) {
    // this.listTypeService.getById("ROLES")
    //   .pipe(first())
    //   .subscribe((data: ListTypeItem[]) => {
    debugger;
        //switch (data?.find(x => x.listTypeItemId == role)?.itemCode) {
        switch (this.segmentList.find(x => x.listTypeItemId == segment)?.itemCode) {
          case this.environment.engRoleCode:
            this.isEng = true;
            this.GetDistributorByContactId();
            break;

          case this.environment.distRoleCode:
            this.isDist = true;
            this.GetDistributorByContactId();
            break;

          case this.environment.custRoleCode:
            this.isDist = false;
            this.isEng = false;
            this.userprofileform.get('distRegions').clearValidators()
            this.userprofileform.get('distRegions').updateValueAndValidity()
            this.userprofileform.get('businessUnitIds').clearValidators()
            this.userprofileform.get('businessUnitIds').updateValueAndValidity()
            this.userprofileform.get('brandIds').clearValidators()
            this.userprofileform.get('brandIds').updateValueAndValidity()
            break;
        }
      ///})
  }

  GetDistributorByContactId() {
    this.userprofileService.getRegionsByConId(this.contactId)
      .pipe(first())
      .subscribe((data: any) => {
        if (data.isSuccessful)
          debugger;
          this.regionList = data.data;
      })
  }

  CreateItem(): FormGroup {
    return this.formBuilder.group({
      id: '',
      userProfileId: '',
      select: false,
      level1Name: '',
      level2Name: '',
      level2Level1Name: '',
      level1id: '',
      level2id: '',
      profileRegionId: ''
    });
  }

  addItem(value: any): void {
    for (let i = 0; i < value.length; i++) {
      this.profileregion = value[i];
      this.profileRegions = this.userprofileform.get('profileRegions') as FormArray;
      this.profileRegions.push(this.formBuilder.group({
        id: '',
        userProfileId: this.profileregion.userProfileId,
        select: false,
        level1Name: this.profileregion.level1Name,
        level2Name: this.profileregion.level2Name,
        level2Level1Name: this.profileregion.level2Level1Name,
        level1id: this.profileregion.level1id,
        level2id: this.profileregion.level2id,
        profileRegionId: ''
      }));
    }

    let frmArray = this.userprofileform.get('profileRegions') as FormArray;
    frmArray.patchValue(this.profilewithregdata);
    this.profilewithregdata = [];

  }


  // convenience getter for easy access to form fields
  get f() { return this.userprofileform.controls; }
  get c() { return this.userprofileform.controls.profileRegions; }

  getName(i) {
    //debugger;
    return this.getControls()[i].value;
  }

  getControls() {
    return (<FormArray>this.userprofileform.get('profileRegions')).controls;
  }

  onprofileClick(value: any) {
    let frmArray = this.userprofileform.get('profileRegions') as FormArray;
    frmArray.clear();
  }

  onUserChange(value: any) {
    //[KG]
    this.contactId = this.userList.filter(x => x.id === value)[0].contactId;
    this.contactType = this.userList.filter(x => x.id === value)[0].contactType;
    if(this.contactType == "CS")
    {
      this.userprofileService.getSitesByConId(this.contactId)
        .pipe(first()).subscribe((data: any) => {
          if (data.data.length > 0) this.siteList = data.data;
          else this.siteList = []
        });
    }
    else if(this.contactType == "DR")
    {
      this.GetDistributorByContactId();
    }
      this.userprofileService.getByUserId(this.contactId, this.contactType)
          .pipe(first()).subscribe((data: any) => {
            this.isCustomer = data.data?.userType.toLowerCase() == "customer";
            if (this.isCustomer) {
              this.userprofileform.get("custSites").setValidators([Validators.required])
              this.userprofileform.get("custSites").updateValueAndValidity();
            }
            this.userprofileform.controls['designation'].setValue(data.data.designation);
            this.userprofileform.controls['distributorName'].setValue(data.data.entityParentName);
            this.contactId = data.data.contactid;
          })
      
  }

  onSubmit() {
    //debugger;
    this.submitted = true;
    this.userprofileform.markAllAsTouched()
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.userprofileform.invalid) {
      return;
    }

    this.userprofile = this.userprofileform.value;

    if (this.userprofileform.get('distRegions').value?.length > 0) {
      var selectarray = this.userprofileform.get('distRegions').value;
      this.userprofile.distRegions = selectarray.map(x => x.id).join(',');
    }

    if (this.userprofileform.get('businessUnitIds').value?.length > 0) {
      var selectarray = this.userprofileform.get('businessUnitIds').value;
      this.userprofile.businessUnitIds = selectarray.map(x => x.id).join(',');
    }

    if (this.userprofileform.get('brandIds').value?.length > 0) {
      var selectarray = this.userprofileform.get('brandIds').value;
      this.userprofile.brandIds = selectarray.map(x => x.id).join(',');
    }

    if (this.userprofileform.get('custSites').value?.length > 0) {
      var selectarray = this.userprofileform.get('custSites').value;
      this.userprofile.custSites = selectarray.map(x => x.id).join(',');
    }

    if (this.id == null) {
      this.userprofileService.save(this.userprofile)
        .pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess(data.messages[0], "Success");
            
            this.router.navigate(["userprofilelist"],
              {
                //relativeTo: this.activeRoute,
                queryParams: { isNSNav: true },
                //queryParamsHandling: 'merge'
              });
          }
        });
    }
    else {
      this.userprofile.id = this.id;
      this.userprofileService.update(this.id, this.userprofile)
        .pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess(data.messages[0], "Success");
            this.router.navigate(["userprofilelist"],
              {
                //relativeTo: this.activeRoute,
                queryParams: { isNSNav: true },
                //queryParamsHandling: 'merge'
              });
          }
        });
    }
  }

}
