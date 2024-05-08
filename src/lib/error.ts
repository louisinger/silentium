export const extractError = (error: any): string => {
  if (error?.response?.data?.error) return error.response.data.error
  return JSON.stringify(error)
}
