import { Component, OnInit } from '@angular/core';

import { User, Contact, Country, ListTypeItem, ProfileReadOnly, CustomerSite } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService, AlertService, CountryService, ListTypeService, ProfileService,
  NotificationService
} from '../_services';
import { EnvService } from '../_services/env/env.service';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ContactService } from '../_services/contact.service';
import { DistributorService } from '../_services/distributor.service';
import { CustomerSiteService } from '../_services/customersite.service';
import { DistributorRegionService } from '../_services/distRegion.service';
import { CustomerService } from '../_services/customer.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { ManufacturerSalesRegionService } from '../_services/manufacturerSalesRegion.service';
import { ManufacturerService } from '../_services/manufacturer.service';



@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
})
export class ContactComponent implements OnInit {
  user: UserDetails;
  newUser: User;
  contactform: FormGroup;
  contact: Contact;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  userType: string;
  id: string;
  countries: Country[];
  code: string = "DESIG";
  listTypeItems: ListTypeItem[];
  masterId: string;
  detailId: string;
  userPwd: string;
  contactmodel: Contact;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  countryCode: string = "";
  inputObj: any;
  inputObj2: any;
  country2Code: string = "";
  pcontactNumber: any;
  inputObj2w: any;
  country2Codew: string = "";
  @ViewChild('phoneInput')
  phoneInput: ElementRef;
  public designations: any[] = [{ key: "1", value: "Ashish" }, { key: "2", value: "CEO" }];
  isEditMode: any;
  isNewMode: any;
  isUser: boolean;
  isUserActive: boolean;
  formData: { [key: string]: any; };
  parentEntity: any
  parentEntityValue: any
  label;
  creatingNewDistributor: boolean;
  distCustName;
  distCustNameValue;
  address: any;
  isNewSetup: boolean;
  role: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private contactService: ContactService,
    private alertService: AlertService,
    private countryService: CountryService,
    private listTypeService: ListTypeService,
    private distributorService: DistributorService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private customersiteService: CustomerSiteService,
    private distRegions: DistributorRegionService,
    private manufacturerService: ManufacturerService,
    private manfSalesRegionsService: ManufacturerSalesRegionService,
    private customerService: CustomerService,
    public environment: EnvService,
  ) { }

  ngOnInit() {
    this.userPwd = "C0mm0npwd@c!m";

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;

    this.contactform = this.formBuilder.group({
      parentEntity: [""],
      distCustName: [""],
      firstName: ['', [Validators.required, Validators.maxLength(512)]],
      lastName: ['', [Validators.required, Validators.maxLength(512)]],
      middleName: [''],
      primaryContactNo: ['', [Validators.required, Validators.pattern("[^a-zA-Z]*")]],
      primaryEmail: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]],
      secondaryContactNo: ['', [Validators.required, Validators.pattern("[^a-zA-Z]*")]],
      secondaryEmail: ['', [Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$"), Validators.required]],
      designationId: ['', [Validators.required, Validators.maxLength(512)]],
      isActive: [true],
      isFieldEngineer: [false],
      isDeleted: [false],
      whatsappNo: ['', [Validators.required, Validators.pattern("[^a-zA-Z]*")]],
      //address: this.formBuilder.group({
      street: ['', Validators.required],
      area: [''],
      place: ['', Validators.required],
      city: ['', Validators.required],
      addrCountryId: ['', Validators.required],
      zip: ['', Validators.compose([Validators.required, Validators.pattern("^[0-9]{4,15}$"), Validators.minLength(4), Validators.maxLength(15)])],
      geoLat: ['0', [Validators.min(-90), Validators.max(90)]],
      geoLong: ['0', [Validators.min(-180), Validators.max(180)]],
      //}),
      contactMapping: this.formBuilder.group({
        mappedFor: null,
        parentId: null,
      }),
    });

    this.detailId = this.route.snapshot.paramMap.get('cid');
    this.masterId = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type');
    // this.role = JSON.parse(sessionStorage.getItem('segments'))[0]?.itemCode;
    // console.log(this.role);
    this.route.queryParams.subscribe((data) => {
      this.creatingNewDistributor = data.creatingNewDistributor != null && data.creatingNewDistributor != undefined && data.creatingNewDistributor == "true";
      this.isNewSetup = data.isNewDistSetUp != null && data.isNewDistSetUp != undefined && data.isNewDistSetUp == "true";
    });

    if (this.type == "DR" || this.type == "CS" || this.type == "MSR") {
      // this.masterId = this.route.snapshot.paramMap.get('cid');
      // this.detailId = this.route.snapshot.paramMap.get('id');
      this.id = this.route.snapshot.paramMap.get('did');;
    }
    if (this.profilePermission != null) {
      if (this.type == "DR" || this.type == "D") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }

      if (this.type == "C" || this.type == "CS") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }

      if (this.type == "M" || this.type == "MSR") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SMANF");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }
    }


    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.countries = data.data;
        },
      });

    this.listTypeService.getById(this.code)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.listTypeItems = data.data;
        },
      });

    switch (this.type) {
      case "C":
        this.label = "Customer"
        this.customerService.getById(this.masterId)
          .subscribe((data: any) => {
            if (!data.isSuccessful || data.data == null) return;
            this.parentEntityValue = data.data.custname
            this.contactform.get('parentEntity').setValue(data.data.custname);
          });
        break;
      case "CS":
        this.label = "Customer Site"
        this.customersiteService.getById(this.detailId)
          .subscribe((data: any) => {
            if (!data.isSuccessful || data.data == null) return;
            this.contactform.get('parentEntity').setValue(data.data.custRegName);
            this.parentEntityValue = data.data.custRegName

            this.distCustName = "Customer";
            this.customerService.getById(this.masterId)
              .subscribe((data: any) => {
                if (!data.isSuccessful || data.data == null) return;
                this.distCustNameValue = data.data.custName

                this.contactform.get('distCustName').setValue(data.data.custName);
              });
          });
        break;
      case "D":
        this.label = "Distributor"
        this.distributorService.getById(this.masterId)
          .subscribe((data: any) => {
            if (!data.isSuccessful || data.data == null) return;
            this.parentEntityValue = data.data.distname
            this.contactform.get('parentEntity').setValue(data.data.distname);
          });
        break;

      case "DR":
        this.label = "Distributor Region"
        this.distRegions.getById(this.detailId)
          .subscribe((data: any) => {
            if (!data.isSuccessful || data.data == null) return;
            debugger;
            this.contactform.get('parentEntity').setValue(data.data.distRegName);
            this.parentEntityValue = data.data.distRegName

            this.contactform.get('place').setValue(data.data.place);
            this.contactform.get('city').setValue(data.data.city);
            this.contactform.get('street').setValue(data.data.street);
            this.contactform.get('zip').setValue(data.data.zip);
            this.contactform.get('geoLat').setValue(data.data.geoLat);
            this.contactform.get('geoLong').setValue(data.data.geoLong);
            this.contactform.get('addrCountryId').setValue(data.data.addrCountryId);


            this.distributorService.getById(this.masterId)
              .subscribe((data: any) => {
                if (!data.isSuccessful || data.data == null) return;
                debugger;
                this.distCustName = "Principal Distributor";
                this.contactform.get('distCustName').setValue(data.data.distName);
                this.distCustNameValue = data.data.distName
              })
          });
        break;


      case "MSR":
        this.label = "Manufacturer Sales Region"
        this.manfSalesRegionsService.getById(this.detailId)
          .subscribe((data: any) => {
            if (!data.isSuccessful || data.data == null) return;
            debugger;
            this.contactform.get('parentEntity').setValue(data.data.salesRegionName);
            this.parentEntityValue = data.data.salesRegionName

            this.contactform.get('place').setValue(data.data.place);
            this.contactform.get('city').setValue(data.data.city);
            this.contactform.get('street').setValue(data.data.street);
            this.contactform.get('zip').setValue(data.data.zip);
            this.contactform.get('geoLat').setValue(data.data.geoLat);
            this.contactform.get('geoLong').setValue(data.data.geoLong);
            this.contactform.get('addrCountryId').setValue(data.data.addrCountryId);


            this.manufacturerService.getById(this.masterId)
              .subscribe((data: any) => {
                if (!data.isSuccessful || data.data == null) return;
                debugger;
                this.distCustName = "Principal Manufacturer";
                this.contactform.get('manfName').setValue(data.data.manfName);
                this.distCustNameValue = data.data.manfName;
              })
          });
        break;
    }

    // if (this.isNewSetup) {
    //   switch (this.type) {
    //     case "CS":
    //       this.label = "Customer Site"
    //       this.customerService.getById(this.detailId).subscribe((data: any) => {
    //         if (data.isSuccessful && data.data) {
    //           this.parentEntity = data.data;
    //           this.contactform.get('distCustName').setValue(this.parentEntity?.custname);
    //           this.distCustName = "Customer";
    //           this.contactform.get('parentEntity').setValue(this.parentEntity.custregname);
    //         }
    //       })

    //       break;
    //     case "DR":
    //       this.label = "Distributor Region"
    //       this.parentEntity = JSON.parse(sessionStorage.getItem('distributor'));
    //       if (!this.parentEntity) {
    //         this.distributorService.getById(this.detailId).subscribe((data: any) => {
    //           if (data.isSuccessful && data.data) {
    //             this.parentEntity = data.data;
    //             this.distCustName = "Principal Distributor";
    //             this.contactform.get('distCustName').setValue(this.parentEntity.distname);
    //           }
    //         })
    //       }
    //       else {
    //         this.distCustName = "Principal Distributor";
    //         this.contactform.get('distCustName').setValue(this.parentEntity.distname);
    //       }

    //       this.parentEntity = JSON.parse(sessionStorage.getItem('distributorRegion'))
    //       this.contactform.get('parentEntity').setValue(this.parentEntity.distregname);
    //       break;

    //   }
    // }


    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }
    this.userType = this.user.contactType;


    // if (this.type == "CS") {
    //   this.customersiteService.getById(this.id)
    //     .pipe(first()).subscribe({
    //       next: (data: any) => {
    //         this.address = data.data.address;
    //         this.contactform.patchValue({ address: data.data.address });
    //       },
    //     });
    // }
    // else if (this.type === "D") {
    //   this.distributorService.getById(this.masterId).pipe(first())
    //     .subscribe((data: any) => {
    //       this.address = data.data.address;
    //       this.contactform.patchValue({ address: data.data.address });
    //     })
    // }
    // else if (this.type === "DR") {
    //   this.distRegions.getById(this.id).pipe(first())
    //     .subscribe((data: any) => {
    //       this.address = data.data.address;
    //       this.contactform.patchValue({ address: data.data.address });
    //     })
    // }
    // else if (this.type === "C") {
    //   this.customerService.getById(this.masterId).pipe(first())
    //     .subscribe((data: any) => {
    //       this.address = data.data.address;
    //       this.contactform.patchValue({ address: data.data.address });
    //     })
    // }


    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.isAdmin) {
        this.hasAddAccess = true;
      }

      this.newUser = new User();
      this.newUser.contactId = this.id;
      this.newUser.contactType = this.type;
      this.accountService.getContactUserStatus(this.newUser)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data != null && data.data != null) {
              this.isUser = data.data.isActive;
              this.isUserActive = data.data.isActive;
            }
          }
        });


      this.contactService.getById(this.id, this.type)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            debugger;
            // this.isUser = data.data.isUser
            // this.isUserActive = data.data.userActive;
            this.formData = data.data;
            this.contactform.patchValue(this.formData);
            if (this.inputObj) {
              this.inputObj.setNumber(data.data.primaryContactNo);
            }
            if (this.inputObj2) {
              this.inputObj2.setNumber(data.data.secondaryContactNo);
            }
            if (this.inputObj2w) {
              this.inputObj2w.setNumber(data.data.whatsappNo);
            }

          },
        });
      this.contactform.disable()
    } else this.isNewMode = true

    this.contactform.get('primaryContactNo').valueChanges
      .subscribe((data: any) => {
        if (this.inputObj) {
          this.inputObj.setNumber(data);
        }
        if (this.inputObj2) {
          this.inputObj2.setNumber(data);
        }
        if (this.inputObj2w) {
          this.inputObj2w.setNumber(data);
        }

        this.contactform.get('secondaryContactNo').setValue(data);
        this.contactform.get('whatsappNo').setValue(data);
      });

    this.contactform.get('primaryEmail').valueChanges
      .subscribe((data: any) => {
        this.contactform.get('secondaryEmail').setValue(data);
      });
  }

  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const phonePattern = /^\+?\d{1,3}[- ]?\d{3}[- ]?\d{4}$/;
      const valid = phonePattern.test(control.value);
      return valid ? null : { 'invalidPhone': { value: control.value } };
    };
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;

      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge',
        });

      this.contactform.enable();
      this.FormControlDisable()
    }
  }

  Back() {
    this.back(!(this.isEditMode || this.isNewMode))
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.contactform.patchValue(this.formData);
    else {
      this.contactform.patchValue({});
      this.contactform.get("parentEntity").setValue(this.parentEntityValue);
      this.contactform.get("distCustName").setValue(this.distCustNameValue);
      this.contactform.get("address").patchValue({ address: this.address });
    }
    this.contactform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.contactService.delete(this.id, this.type).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            if (data.data) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.back(true);
            }
            else {
              this.notificationService.showInfo(data.messages[0], "Info");
            }
          }
          else {
            this.notificationService.showInfo(data.messages[0], "Info");
          }
        })
    }
  }
  FormControlDisable() {
    this.contactform.get("parentEntity").disable()
    this.contactform.get("distCustName").disable()
  }
  ToggleDropdown(id: string) {
    document.getElementById(id).classList.toggle("show")
  }

  get f() {
    return this.contactform.controls;
  }

  get a() {
    var controls: any = (this.contactform.controls.address);
    return controls.controls;
  }

  addUser() {
    if (this.id == null) {
      return this.notificationService.showInfo("Save contact before creating user.", "Info");
    }

    // [KG]
    this.newUser = new User;
    this.contactmodel = this.contactform.value;
    this.newUser.firstName = this.contactmodel.firstName,
      this.newUser.lastName = this.contactmodel.lastName,
      this.newUser.email = this.contactmodel.primaryEmail,
      this.newUser.password = this.userPwd,
      this.newUser.confirmPassword = this.userPwd,
      this.newUser.contactId = this.id,
      this.newUser.contactType = this.type
    this.newUser.activation = true;

    this.accountService.register(this.newUser).subscribe((data: any) => {
      if (data.isSuccessful) {
        this.isUser = true;
        this.isUserActive = true;
        this.notificationService.showSuccess(data.messages[0], "Success");
      }
      else this.notificationService.showInfo(data.messages[0], "Info")
    })
  }

  deactivateUser() {
    if (this.id == null) {
      return this.notificationService.showInfo("User is not created for this contact.", "Info");
    }
    // [KG]
    this.newUser = new User;
    this.contactmodel = this.contactform.value;
    // this.newUser.firstName = this.contactmodel.firstName;
    //   this.newUser.lastName = this.contactmodel.lastName;
    this.newUser.email = this.contactmodel.primaryEmail;
    this.newUser.contactId = this.id;
    this.newUser.contactType = this.type;
    this.newUser.activation = false;

    this.accountService.deactivateuser(this.newUser).subscribe((data: any) => {
      if (data.isSuccessful) {
        this.isUser = true;
        this.isUserActive = false;
        this.notificationService.showSuccess(data.messages[0], "Success");
      }
      else this.notificationService.showInfo(data.messages[0], "Info")
    })
  }


  telInputObjectCo(obj) {
    this.inputObj2 = obj;
    if (this.pcontactNumber) {
      obj.setNumber(this.pcontactNumber);
    }
  }

  telInputObjectCow(obj) {
    this.inputObj2w = obj;
    if (this.pcontactNumber) {
      obj.setNumber(this.pcontactNumber);
    }
  }

  telInputObject(obj) {
    this.inputObj = obj;
    if (this.pcontactNumber) {
      obj.setNumber(this.pcontactNumber);
    }
  }

  countryChange(country: any) {
    this.countryCode = country.dialCode;
  }

  countryChange2(country: any) {
    this.country2Code = country.dialCode;
  }

  countryChange2w(country: any) {
    this.country2Codew = country.dialCode;
  }

  getNumber(e: any) {
  }

  async onSubmit(back = false, createUser = false) {
    this.contactform.markAllAsTouched()
    this.alertService.clear();

    // stop here if form is invalid
    if (this.contactform.invalid) {
      return;
    }

    this.loading = true;

    this.contact = this.contactform.value;

    if (this.contact.primaryContactNo != null) {
      if (!this.contact.primaryContactNo.includes("+")) {
        this.contact.primaryContactNo = '+' + this.countryCode + this.contact.primaryContactNo;
      }
    }

    if (this.contact.secondaryContactNo != null) {
      if (!this.contact.secondaryContactNo.includes("+")) {
        this.contact.secondaryContactNo = '+' + this.country2Code + this.contact.secondaryContactNo;
      }
    }

    if (this.contact.whatsappNo != null) {
      if (!this.contact.whatsappNo.includes("+")) {
        this.contact.whatsappNo = '+' + this.country2Codew + this.contact.whatsappNo;
      }
    }

    this.contact.zip = String(this.contact.zip);
    this.contact.geoLat = String(this.contact.geoLat);
    this.contact.geoLong = String(this.contact.geoLong);


    if (this.type == "D") {
      //this.contact.contactMapping.mappedFor = "DIST";

    }
    else if (this.type == "DR") {
      this.id = this.route.snapshot.paramMap.get('did');
      this.contact.regionId = this.detailId;
      //this.contact.contactMapping.mappedFor = "REG";
    }
    else if (this.type == "C") {
      //this.contact.contactMapping.mappedFor = "CUST";
    }
    else if (this.type == "CS") {
      this.id = this.route.snapshot.paramMap.get('did');
      this.contact.siteId = this.detailId;
      //this.contact.contactMapping.mappedFor = "SITE";
    }
    else if (this.type == "MSR") {
      this.id = this.route.snapshot.paramMap.get('did');
      this.contact.salesRegionId = this.detailId;
      //this.contact.contactMapping.mappedFor = "REG";
    }

    this.contact.contactMapping.parentId = this.masterId;

    if (this.id == null) {

      this.contactService.save(this.contact, this.type)
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.id = data.data.id;
            this.notificationService.showSuccess(data.messages[0], "Success");
            this.contact.id = data.id;
            this.loading = false;
            this.contactform.disable()
            this.isEditMode = false;
            this.isNewMode = false;
            this.back(true);
          }
          else {
            this.notificationService.showInfo(data.messages[0], "Info");
          }
        })

    }
    else {
      this.contact.id = this.id;
      this.contactService.update(this.id, this.contact, this.type).subscribe((data: any) => {
        if (data.isSuccessful) {
          this.notificationService.showSuccess(data.messages[0], "Success");
          this.contactform.disable()
          this.isEditMode = false;
          this.isNewMode = false;
          this.back(true);
        }

        this.contact.id = data.id;
        this.loading = false;
      })
    }
  }

  back(isNSNav) {
    if (this.type == "D" && this.isNewSetup) {
      this.router.navigate(['distributorregion', this.masterId], {
        queryParams: {
          isNSNav,
          isNewDist: true
        }
      });
    }
    else if (this.type == "C" && this.isNewSetup) {
      this.router.navigate(['customersite', this.masterId], {
        queryParams: {
          isNSNav,
          isNewDist: true
        }
      });
    }
    // else if (this.type == "D") {
    //   this.router.navigate(['contactlist', this.type, this.masterId], {
    //     queryParams: {
    //       isNSNav,
    //     }
    //   });
    // }
    else if (this.type == "DR") {
      this.router.navigate(['contactlist', this.type, this.masterId, this.detailId], {
        queryParams: {
          isNSNav
        }
      });
    }
    // else if (this.type == "C") {
    //   this.router.navigate(['contactlist', this.type, this.masterId], {
    //     queryParams: {
    //       isNSNav
    //     }
    //   });
    // }
    else if (this.type == "CS") {
      this.router.navigate(['contactlist', this.type, this.masterId, this.detailId], {
        queryParams: {
          isNSNav
        }
      });
    }
    else if (this.type == "MSR") {
      this.router.navigate(['contactlist', this.type, this.masterId, this.detailId], {
        queryParams: {
          isNSNav
        }
      });
    }
  }
}
