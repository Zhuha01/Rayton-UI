// `PrivateService.createUserWithNewTenant` is for local / superuser test flows
// (user + new tenant in one call).
import { OpenAPI, PrivateService } from "../../src/client"

OpenAPI.BASE = `${process.env.VITE_API_URL}`

export const createUser = async ({
  email,
  password,
}: {
  email: string
  password: string
}) => {
  return await PrivateService.createUserWithNewTenant({
    requestBody: {
      email,
      password,
      full_name: "Test User",
    },
  })
}
