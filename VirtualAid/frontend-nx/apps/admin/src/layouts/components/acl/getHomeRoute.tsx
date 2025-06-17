/**
 *  Set Home URL based on User Roles
 * @param: role used to differentiate the role of governer from string.
 */
const getHomeRoute = (role: string) => {
  if (role === 'governor') return '/map'
  else if (role === 'client') return '/acl'
  else return '/reports-and-analytics'

  // else return '/home'
}

export default getHomeRoute
