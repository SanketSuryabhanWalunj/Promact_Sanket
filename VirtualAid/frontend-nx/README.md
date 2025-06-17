
# VirtualAidFrontend  
  
## Install  dependencies  
  
To install dependecies run `npm  ci`.  

To run this project, you will need to create `.env.development` and `.env.production` file in root of the project folder and add the following environment variables:  
  
- `NEXT_PUBLIC_API_BASE_URL`:  Backend  base  URL  for  API  call,  like  `https://localhost:44373/api`  
- `NEXT_PUBLIC_REGISTER_EMAIL:vaRegisterEmail`:  Public register email  
- `NEXT_PUBLIC_USER=vauser`:  Public user email 
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY:pk_test_51OBEvoGfyzKg5PP2PoCXl7hIjPonAGLDUITVeiBtjKOE0BbaiPWHUabrzPUIghYpjVij48hX6pYDHn8h6Y4uAFlR00J99G8lv7`:  Stripe key to use in payment 
  
## Start  the  app  
  
To start the "admin" app in development server, run `nx  serve  admin` or `npx  nx  serve  admin`. Open your browser and navigate to http://localhost:4200/.  
  
To start the "individual" app in development server, run `nx  serve  individual  --port  4201` or `npx  nx  serve  admin  --port  4201`. Open your browser and navigate to http://localhost:4201/.  
  
## To  build  Admin  and  Individual  App  
  
`npx  nx  build  admin`  
`npx  nx  build  individual`
