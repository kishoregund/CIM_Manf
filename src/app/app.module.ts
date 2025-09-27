import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, DatePipe, DecimalPipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { FooterComponent } from './footer/footer';
import { NavSideMenuComponent } from './nav-sidemenu/nav-sidemenu.component';
// used to create fake backend
import { ErrorInterceptor, fakeBackendProvider, JwtInterceptor } from './_helpers';
import { LayoutComponent } from './layout/layout.component';
import { AlertComponent } from './_components';
// Datepicker module
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgGridModule } from 'ag-grid-angular';
import { SparePartListComponent } from './spareparts/sparepartlist';
import { SparePartComponent } from './spareparts/sparepart';
import { DistributorComponent } from './distributor/distributor';
import { ContactComponent } from './contact/contact';
import { DistributorRegionComponent } from './distributorRegion/distributor-region';
import { CustomerComponent } from './customer/customer';
import { CustomerSiteComponent } from './customersite/customersite';
import { InstrumentComponent } from './instrument/instrument';
import { DistributorListComponent } from './distributor/distributorlist';
import { DistributorRegionListComponent } from './distributorRegion/distregionlist';
import { RenderComponent } from './distributor/rendercomponent';
import { CustomerListComponent } from './customer/customerlist';
import { InstrumentListComponent } from './instrument/instrumentlist';
import { ContactListComponent } from './contact/contactlist';
import { CustomerSiteListComponent } from './customersite/customersitelist';
//import { SearchComponent } from './search/search';
// import { SRAuditTrailComponent } from './sraudittrail/sraudittrail';
// import { lnkRenderComponent } from './search/lnkrendercomponent';
// import { InstrumentRonlyComponent } from './instrumentReadonly/instrument';
import { ToastrModule } from 'ngx-toastr';
import { RoleListComponent } from './role/rolelist';
import { RoleComponent } from './role/role';
import { ProfileListComponent } from './profile/profilelist';
import { ProfileComponent } from './profile/profile';
import { UserProfileListComponent } from './userprofile/userprofilelist';
import { UserProfileComponent } from './userprofile/userprofile';
import { CurrencyListComponent } from './currency/currencylist';
import { CurrencyComponent } from './currency/currency';
import { CountryListComponent } from './country/countrylist';
import { CountryComponent } from './country/country';
import { MasterListComponent } from './masterlist/masterlist';
import { IsEscationSupervisor, MasterListItemComponent } from './masterlist/masterlistitem';
import { ModelContentComponent } from './masterlist/modelcontent';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ModelEngContentComponent } from './serviceRequest/modelengcontent';
import { MRenderComponent } from './masterlist/rendercomponent';
import { ExportSparePartComponent } from './spareparts/export';
import { ServiceRequestComponent } from './serviceRequest/serviceRequest';
import { ServiceRequestListComponent } from './serviceRequest/serviceRequestlist';
import { ModelEngActionContentComponent } from './serviceRequest/modelengactioncontent';
import { WorkdoneContentComponent } from './serviceReport/workdonecontent';
import { WorkTimeContentComponent } from './serviceReport/workTime';
import { ServiceReportComponent } from './serviceReport/serviceReport';
import { ServiceReportListComponent } from './serviceReport/serviceReportlist';
import { SignaturePadModule } from 'angular2-signaturepad';
// import { StaydetailsListComponent } from './Staydetails/staydetailslist/staydetailslist.component';
// import { StaydetailsComponent } from './Staydetails/staydetails/staydetails.component';
// import { VisadetailsListComponent } from './Visadetails/visadetailslist/visadetailslist.component';
// import { VisadetailsComponent } from './Visadetails/visadetails/visadetails.component';
// import { LocalexpensesComponent } from './LocalExpenses/localexpenses/localexpenses.component';
// import { LocalexpenseslistComponent } from './LocalExpenses/localexpenseslist/localexpenseslist.component';
import { CustomersatisfactionsurveyComponent } from './customersatisfactionsurvey/customersatisfactionsurvey/customersatisfactionsurvey.component';
import { CustomersatisfactionsurveylistComponent } from './customersatisfactionsurvey/customersatisfactionsurveylist/customersatisfactionsurveylist.component';
// import { TraveldetailsComponent } from './traveldetails/traveldetails/traveldetails.component';
// import { TraveldetailslistComponent } from './traveldetails/traveldetailslist/traveldetailslist.component';
// import { ReportListComponent } from './report/reportlist';
// import { CustPayComponent } from './report/custpay';
// import { srcontrevComponent } from './report/srcontrev';
// import { sppartrevComponent } from './report/sppartrev';
// import { qtsentComponent } from './report/qtsent';
// import { sostatusComponent } from './report/sostatus';
// import { srrptComponent } from './report/srrpt';
import { AmcComponent } from './amc/amc';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AmcListComponent } from './amc/amclist';
import { AmcInstrumentRendererComponent } from './amc/amc-instrument-renderer.component';
import { FilerendercomponentComponent } from './instrument/filerendercomponent.component';
 import { DistributordashboardComponent } from './distributordashboard/distributordashboard.component';
// import { CustdashboardsettingsComponent } from './dashboardsettings/custdashboardsettings';
// import { DistributordashboardsettingsComponent } from './distributordashboardsettings/distributordashboardsettings.component';
import { SparepartsrecommendedComponent } from './sparepartsrecommended/sparepartsrecommended.component';
// import { PreventivemaintenancetableComponent } from './preventivemaintenancetable/preventivemaintenancetable.component';
// import { PrevchklocpartelementvalueComponent } from './masterlist/prevchklocpartelementvalue.component';
import {
  DayService,
  MonthAgendaService,
  MonthService,
  RecurrenceEditorModule,
  ScheduleModule,
  TimelineMonthService,
  WeekService,
  WorkWeekService
} from '@syncfusion/ej2-angular-schedule';
import { ChangepasswoardComponent } from './account/changepasswoard.component';
import { ForgotpasswoardComponent } from './account/forgotpasswoard.component';
// import { AudittrailComponent } from './audittrail/audittrail.component';
// import { AudittrailDetailsComponent } from './audittrail/audittraildetails';
// import { ServiceRComponent } from './serviceRequest/ServicerequestRenderer';
import { NotificationspopupComponent } from './notificationspopup/notificationspopup.component';
import { LoaderComponent } from './loader/loader.component';
// import { OfferRequestListRenderer } from './Offerrequest/offerrequestlistrenderer';
import { ImportDataComponent } from './importdata/import.component';
import { AdvancerequestformComponent } from './advancerequestform/advancerequestform.component';
import { AdvancerequestlistformComponent } from './advancerequestform/advancerequestformlist.component';
import { DistributorfilterComponent } from './distributorfilter/distributorfilter.component';
// import { ServicereqestreportComponent } from './servicereqestreport/servicereqestreport.component';
// import { ReportfilterComponent } from './reportfilter/reportfilter.component';
// import { ServicecompletionreportComponent } from './servicecompletionreport/servicecompletionreport.component';
// import { PendingquotationrequestComponent } from './pendingquotationrequest/pendingquotationrequest.component';
// import { ServicecontractrevenuereportComponent } from './servicecontractrevenuereport/servicecontractrevenuereport.component';
import { CostofownershipComponent } from './costofownership/costofownership.component';
import { EnvServiceProvider } from './_services/env/env.service.provider';
import { EngdashboardComponent } from './engdashboard/engdashboard.component';
import { CustomAmountPipe } from './_pipes/amount.pipe';
import { CIMComponent } from './account/cim.component';
// import { ImportOfferRequestComponent } from './Offerrequest/importofferrequest.component';
import { ImportDistributorComponent } from './distributor/importdistributor.component';
import { CreateBusinessUnitComponent } from './account/businessunit.component';
import { CreateManfBusinessUnitComponent } from './account/manfbusinessunit.component';
//import { CreateCompanyComponent } from './account/company.component';
import { CreateBrandComponent } from './account/brand.component';
import { ConfigBsDatepicker, GetParsedDate, GetParsedDatePipe } from './_helpers/Providers';
import { PastservicereportComponent } from './pastservicereport/pastservicereport.component';
import { DownloadReportFile, PastservicereportlistComponent } from './pastservicereport/pastservicereportlist.component';
import { Accessories } from './instrument/Accessories.component';
import { BrandListComponent } from './account/brandlist.component';
import { BusinessUnitListComponent } from './account/businessunitlist.component';
import { ManfBusinessUnitListComponent } from './account/manfbusinessunitlist.component';
//import { CompanyListComponent } from './account/companylist.component';
import SetUp from './account/setup.component';
import ChangeCIM from './account/ChangeCIM.component';
import ExistingCIM from './account/Existing.component';
import { ManufacturerListComponent } from './manufacturer/manufacturerlist';
import { ManufacturerComponent } from './manufacturer/manufacturer';
import { ManufacturerSalesRegionListComponent } from './manufacturersalesregion/manfsalesregionlist';
import { ManufacturerSalesRegionComponent } from './manufacturersalesregion/manfsalesregion';
import { CustomerInstrumentListComponent } from './customerinstrument/customerinstrumentlist';
import { CustomerInstrumentComponent } from './customerinstrument/customerinstrument';
import { ProcessFileRenderer } from './FileRender/ProcessFileRenderer';
import { EngineerSchedulerComponent } from './engineerscheduler/engineerscheduler.component';
import { EngschedulerComponent } from './engscheduler/engineerscheduler.component';
import { CustSPInventoryComponent } from './custspinventory/custspinventory';
import { CustspinventorylistComponent } from './custspinventory/Custspinventorylist.component';
import { OfferrequestComponent, OfferRequestCountryComponent, OfferrequestCurrencyComponent } from './offerrequest/Offerrequest.component';
import { OfferrequestlistComponent } from './offerrequest/Offerrequestlist.component';
import { SparequotedetComponent } from './offerrequest/sparequotedet.component';
import { OfferRequestListRenderer } from './offerrequest/offerrequestlistrenderer';
import { TravelexpenseComponent } from './travelexpense/travelexpense.component';
import { TravelexpenseListComponent } from './travelexpense/travelexpenseslist.component';
import { TravelexpenseItemComponent } from './travelexpense/travelexpenseitem.component';
import { TravelinvoiceComponent } from './travelinvoice/travelinvoice.component';
import { TravelInvoiceListComponent } from './travelinvoice/travelinvoicelist.component';
import { TenantComponent } from './tenant/tenant.component';
import { TenantListComponent } from './tenant/tenantlist.component';


@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    NavSideMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    FooterComponent,
    LayoutComponent,
    AlertComponent,
    TenantComponent,
    TenantListComponent,
    SparePartComponent,
    SparePartListComponent,
    DistributorComponent,
    ManufacturerComponent,
    ContactComponent,
    DistributorRegionComponent,
    CustomerComponent,
    CustomerSiteComponent,
    InstrumentComponent,
    DistributorListComponent,
    DistributorRegionListComponent,
    ManufacturerListComponent,
    ManufacturerSalesRegionListComponent,
    ManufacturerSalesRegionComponent,
    RenderComponent,
    CustomerListComponent,
    InstrumentListComponent,
    ContactListComponent,
    CustomerSiteListComponent,
    CustomerInstrumentListComponent,
    CustomerInstrumentComponent,
    // SearchComponent,
    // SRAuditTrailComponent,
    // lnkRenderComponent,
    // InstrumentRonlyComponent,
    RoleComponent,
    RoleListComponent,
    ProfileComponent,
    ProfileListComponent,
    UserProfileListComponent,
    UserProfileComponent,
    CurrencyListComponent,
    CurrencyComponent,
    CountryListComponent,
    CountryComponent,
    MasterListComponent,
    MasterListItemComponent,
    ModelContentComponent,
    MRenderComponent,
    ExportSparePartComponent,
    ServiceRequestComponent,
    ServiceRequestListComponent,
    ModelEngContentComponent,
    ModelEngActionContentComponent,
    ServiceReportComponent,
    ServiceReportListComponent,
    WorkdoneContentComponent,
    WorkTimeContentComponent,
    // StaydetailsListComponent,
    // StaydetailsComponent,
    // VisadetailsListComponent,
    // VisadetailsComponent,
    // LocalexpensesComponent,
    // LocalexpenseslistComponent,
    CustomersatisfactionsurveyComponent,
    CustomersatisfactionsurveylistComponent,
    // TraveldetailsComponent,
    // TraveldetailslistComponent,
    // ReportListComponent,
    // CustPayComponent,
    // srcontrevComponent,
    // sppartrevComponent,
    // qtsentComponent,
    // sostatusComponent,
    // srrptComponent,
    AmcComponent,
    AmcListComponent,
    DashboardComponent,
    OfferrequestComponent,
    OfferrequestlistComponent,
    SparequotedetComponent,
    OfferRequestListRenderer,
    AmcInstrumentRendererComponent,
    FilerendercomponentComponent,
    DistributordashboardComponent,
    // CustdashboardsettingsComponent,
    // DistributordashboardsettingsComponent,
    SparepartsrecommendedComponent,
    CustSPInventoryComponent,
    CustspinventorylistComponent,    
    // PreventivemaintenancetableComponent,
    // PrevchklocpartelementvalueComponent,
    EngineerSchedulerComponent,
    ChangepasswoardComponent,
    ForgotpasswoardComponent,
    // AudittrailComponent,
    // AudittrailDetailsComponent,
    // ServiceRComponent,
    NotificationspopupComponent,
    LoaderComponent,    
    ProcessFileRenderer,
    TravelexpenseComponent,
    TravelexpenseListComponent,
    TravelexpenseItemComponent,
    TravelinvoiceComponent,
    TravelInvoiceListComponent,
    ImportDataComponent,
    AdvancerequestformComponent,
    AdvancerequestlistformComponent,
    DistributorfilterComponent,
    // ServicereqestreportComponent,
    // ReportfilterComponent,
    // ServicecompletionreportComponent,
    // PendingquotationrequestComponent,
    // ServicecontractrevenuereportComponent,
     CostofownershipComponent,
    EngdashboardComponent,
    CustomAmountPipe,
    EngschedulerComponent,
    CIMComponent,
    //ImportOfferRequestComponent,
    OfferrequestCurrencyComponent,
    OfferRequestCountryComponent,
    IsEscationSupervisor,
    //ImportDistributorComponent,
    CreateBusinessUnitComponent,
    CreateManfBusinessUnitComponent,
    CreateBrandComponent,
    // CreateCompanyComponent,
    PastservicereportComponent,
    PastservicereportlistComponent,
    DownloadReportFile,
    Accessories,
    BrandListComponent,
    BusinessUnitListComponent,
    ManfBusinessUnitListComponent,
    //CompanyListComponent,
    SetUp,
    ChangeCIM,
    ExistingCIM
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgSelectModule,
    NgbModule,
    Ng2TelInputModule,
    SignaturePadModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 2000,
      preventDuplicates: true,
    }),
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    AgGridModule.withComponents([]),
    ScheduleModule, RecurrenceEditorModule
  ],
  providers: [EnvServiceProvider, DecimalPipe, { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: BsDatepickerConfig, useFactory: ConfigBsDatepicker },
    { provide: Date, useFactory: GetParsedDate },
    { provide: DatePipe, useFactory: GetParsedDatePipe },
    fakeBackendProvider, DayService, WeekService, MonthService, WorkWeekService, MonthAgendaService, TimelineMonthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
