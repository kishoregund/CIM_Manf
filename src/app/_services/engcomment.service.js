"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var environment_1 = require("../../environments/environment");
var EngCommentService = /** @class */ (function () {
    function EngCommentService(router, http) {
        this.router = router;
        this.http = http;
    }
    EngCommentService.prototype.save = function (engcomment) {
        return this.http.post(environment_1.environment.apiUrl + "/SREngComments", engcomment);
    };
    EngCommentService.prototype.getAll = function () {
        return this.http.get(environment_1.environment.apiUrl + "/SREngComments");
    };
    EngCommentService.prototype.getById = function (id) {
        return this.http.get(environment_1.environment.apiUrl + "/SREngComments/" + id);
    };
    EngCommentService.prototype.searchByKeyword = function (param, custSiteId) {
        param = param == "" ? "undefined" : param;
        return this.http.get(environment_1.environment.apiUrl + "/SREngComments/GetInstrumentBySerialNo/" + param + "/" + custSiteId);
    };
    EngCommentService.prototype.update = function (id, params) {
        return this.http.put(environment_1.environment.apiUrl + "/SREngComments/" + id, params)
            .pipe(operators_1.map(function (x) {
            return x;
        }));
    };
    EngCommentService.prototype.delete = function (id) {
        return this.http.delete(environment_1.environment.apiUrl + "/SREngComments/" + id)
            .pipe(operators_1.map(function (x) {
            return x;
        }));
    };
    EngCommentService = __decorate([
        core_1.Injectable({ providedIn: 'root' }),
        __metadata("design:paramtypes", [router_1.Router,
            http_1.HttpClient])
    ], EngCommentService);
    return EngCommentService;
}());
exports.EngCommentService = EngCommentService;
//# sourceMappingURL=engcomment.service.js.map