import { Component, OnInit } from '@angular/core';

import { User, Distributor, Country, ResultMsg, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, CountryService, NotificationService, ProfileService, ListTypeService } from '../_services';
import { Guid } from 'guid-typescript';
import { DistributorService } from '../_services/distributor.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { ManufacturerService } from '../_services/manufacturer.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';


@Component({
  selector: 'app-distributor',
  templateUrl: './distributor.html',
})
export class DistributorComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  distributorModel: Distributor;
  loading = false;
  submitted = false;
  isSave = false;
  distributorId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isEditMode: boolean;
  isNewMode: boolean;


  isNewSetUp: boolean = false;
  formData: { [key: string]: any; };
  PaymentTermsList: any;
  manfList: any;
  dropdownSettings: IDropdownSettings = {};

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private distributorService: DistributorService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService,
    private manfService: ManufacturerService
  ) {

    this.form = this.formBuilder.group({
      distName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      payterms: ['', Validators.required],
      manufacturerIds: ['', Validators.required],
      code: [''],
      isBlocked: false,
      isActive: true,
      isDeleted: [false],
      //address: this.formBuilder.group({
      street: ['', Validators.required],
      area: [''],
      place: ['', Validators.required],
      city: ['', Validators.required],
      addrCountryId: ['', Validators.required],
      zip: ['', Validators.compose([Validators.required, Validators.pattern("^[0-9]{4,15}$"), Validators.minLength(4), Validators.maxLength(15)])],
      geoLat: ['0', [Validators.min(-90), Validators.max(90)]],
      geoLong: ['0', [Validators.min(-180), Validators.max(180)]],
      //isActive: true,
      //}),
    });

  }

  ngOnInit() {
    this.dropdownSettings = {
      idField: 'id',
      textField: 'manfName',
    };

    this.distributorId = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe((data) => {
      this.isNewSetUp = data.isNewSetUp != null && data.isNewSetUp != undefined;
    });


    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
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



    this.listTypeService.getById("GPAYT")
      .subscribe((data: any) => this.PaymentTermsList = data.data);

    this.manfService.getAll()
      .subscribe((data: any) => this.manfList = data.data);


    this.countryService.getAll()
      .pipe(first()).subscribe({
        next: (data: any) => {
          this.countries = data.data
        }
      });

    if (this.distributorId != null) {
      this.hasAddAccess = false;

      if (this.user.isAdmin) {
        this.hasAddAccess = true;
      }

      this.distributorService.getById(this.distributorId)
        .pipe(first()).subscribe((data: any) => {
          debugger;
          this.formData = data.data;

          var subreq = data.data.manufacturerIds?.split(',');
          let items: any = [];
          if (subreq != null && subreq.length > 0) {
            for (var i = 0; i < subreq.length; i++) {
              let t = { id: subreq[i] }
              items.push(t);
            }
            this.formData.manufacturerIds = items;
            //this.form.patchValue({ "manufacturerIds": items });
          }

          this.form.patchValue(this.formData);


        });

      this.form.disable()
    }
    else {
      this.isEditMode = true;
    }

  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  // get a() {
  //   var controls: any = (this.form.controls.address);
  //   return controls.controls;
  // }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.form.enable();
      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });
      this.form.get("code").disable()
    }
  }

  Back() {
    this.router.navigate(["distributorlist"]);
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.distributorId != null) this.form.patchValue(this.formData);
    else this.form.reset();
    this.form.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.distributorService.delete(this.distributorId).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["distributorlist"], {
              queryParams: { isNSNav: true },
            });
          }
          else {
            this.notificationService.showInfo(data.messages[0], "Info");
          }
        })
    }
  }


  onSubmit() {
    this.submitted = true;
    this.form.markAllAsTouched()
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.distributorModel = this.form.value;
    if (this.form.get('manufacturerIds').value?.length > 0) {
      var selectarray = this.form.get('manufacturerIds').value;
      this.distributorModel.manufacturerIds = selectarray.map(x => x.id).join(',');
    }

    if (this.distributorId == null) {
      this.distributorId = Guid.create().toString();
      //this.distributorModel = this.form.value;
      this.distributorModel.id = this.distributorId;
      this.distributorService.save(this.distributorModel)
        .subscribe((data: any) => {
          if (!data.isSuccessful) return;
          this.router.navigate(['distributorregion', this.distributorId], {
            queryParams: {
              isNSNav: true,
              isNewDist: true
            }
          });
          // sessionStorage.setItem("distributor", JSON.stringify(this.distributorModel));
          // this.router.navigate([`/contact/${this.type}/${this.distributorId}`], {
          //   queryParams: {
          //     isNewDistSetUp: true,
          //     isNSNav: true
          //   }
          // })
        });
    }
    else {
      //this.distributorModel = this.form.value;
      this.distributorModel.id = this.distributorId;
      debugger;
      this.distributorService.update(this.distributorId, this.form.value)
        .pipe(first()).subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess(data.messages[0], "Success");
            this.router.navigate(["distributorlist"], {
              queryParams: {
                isNewMode: true,
                isNSNav: true
              }
            });
          }
          else this.notificationService.showInfo(data.messages[0], "Info");

        });
    }


  }

}
