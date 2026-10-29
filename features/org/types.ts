export interface OrganizationMember {
  userId: string
  name: string
  imageUrl: string
  // Where recaps go; null when the member can't receive them
  email: string | null
}
