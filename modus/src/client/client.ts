import { TIDClient } from '@trimble-oss/trimble-id-react'

const tidClient = new TIDClient({
  config: {
    configurationEndpoint: "https://id.trimble.com/.well-known/openid-configuration",
    clientId: "d9d21ed0-14e7-4887-ba4b-d12ac2f2f466",
    redirectUrl: "http://localhost:4200/authenticated",
    logoutRedirectUrl: "http://localhost:4200/authentication",
    scopes: ["TDAAS"],
  }
})

export default tidClient