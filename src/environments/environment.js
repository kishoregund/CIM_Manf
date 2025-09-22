"use strict";
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
exports.environment = {
    production: false,
    apiUrl: 'https://localhost:44317/api',
    uiUrl: 'https://localhost:44378/',
    configTypeId: "4c155b3e-7526-11eb-97d1-1c39472d435b",
    custRoleId: "36eb70f8-0247-11ec-8e31-fc45964f576b",
    distRoleId: "36fafd78-0247-11ec-8e31-fc45964f576b",
    engRoleId: "374154ac-0247-11ec-8e31-fc45964f576b",
    INS: "ec1f4f33-1d31-11ec-92d1-fc45964f576b",
    ANAS: "ecf9de58-1d31-11ec-92d1-fc45964f576b",
    PRMN1: "ed6046d0-1d31-11ec-92d1-fc45964f576b",
    PRMN2: "edf84b8f-1d31-11ec-92d1-fc45964f576b",
    REWK: "ee4b92b8-1d31-11ec-92d1-fc45964f576b",
    CRMA: "eeacf156-1d31-11ec-92d1-fc45964f576b",
    zohocodeapi: "https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.LC5XN00TMI5IFL8R9T7FZYFTEOMLKY&response_type=code&redirect_uri=https://localhost:44378/custpayrpt&access_type=offline",
    zohoaccessapi: "https://accounts.zoho.com/oauth/v2/token?code={0}&client_id=1000.LC5XN00TMI5IFL8R9T7FZYFTEOMLKY&client_secret=c3bda561c4b6ccb5a9064c828a6f892389e8c4f121&redirect_uri=https://localhost:44378/custpayrpt&grant_type=authorization_code",
    client: "1000.UI60D3EU4DEZJZOS0G873SEAUPNY0A",
    secret: "4192fa27f500e7a8a0b23f960d2d78d26de84c56c3",
    redirecturl: "https://localhost:44378/custpayrpt",
    bookapi: "https://books.zoho.com/api/v3"
};
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
//# sourceMappingURL=environment.js.map