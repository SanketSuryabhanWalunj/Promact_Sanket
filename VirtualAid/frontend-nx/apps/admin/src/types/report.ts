export type CountInMonth = {
  monthNumber: number
  monthName: string
  count: number
}

export type UserPermissionType = {
  totalUser: number
  consentCount: number
}

export type UserPerMonthType = {
  totalCount: number
  monthCountList: CountInMonth[]
}

export type CertifiedUserPerMonthType = {
  totalCount: number
  monthCountList: CountInMonth[]
}

export type PurchasePerMonthType = CountInMonth[]
