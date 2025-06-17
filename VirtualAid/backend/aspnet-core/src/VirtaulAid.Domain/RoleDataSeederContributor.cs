using System;
using System.Threading.Tasks;
using VirtaulAid.Courses;
using VirtaulAid.Roles;
using VirtaulAid.Users;
using Volo.Abp;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid
{
    public class RoleDataSeederContributor : IDataSeedContributor, ITransientDependency
    {
        private readonly IRepository<Role, Guid> _roleRepository;
        private readonly IRepository<UserDetail> _userRepository;
        private readonly IRepository<UserDetailRoleMapping> _userRoleRepository;
        private readonly IRepository<CourseTypePrice> _coursePriceRepository;

        public RoleDataSeederContributor(IRepository<Role, Guid> roleRepository,
            IRepository<UserDetail> userRepository,
            IRepository<UserDetailRoleMapping> userRoleRepository,
            IRepository<CourseTypePrice> courseTypeRepository)
        {
            _roleRepository = roleRepository;
            _userRepository = userRepository;
            _userRoleRepository = userRoleRepository;
            _coursePriceRepository = courseTypeRepository;
        }
        public async Task SeedAsync(DataSeedContext context)
        {
            await SeedRoleAsync();
            await SeedSuperAdminAsync();
            await SeedCourseTypeWithPriceAsync();
        }

        /// <summary>
        /// Method to seed roles.
        /// </summary>
        /// <returns>Task.</returns>
        private async Task SeedRoleAsync()
        {
            var individualDetails = await _roleRepository.FirstOrDefaultAsync(x => x.Name == "Individual");
            if (individualDetails == null)
            {
                await _roleRepository.InsertAsync(
                    new Role
                    {
                        Name = "Individual",
                    },
                    autoSave: true
                );

            }

            var adminDetails = await _roleRepository.FirstOrDefaultAsync(x => x.Name == "Admin");
            if (adminDetails == null)
            {
                await _roleRepository.InsertAsync(
                    new Role
                    {
                        Name = "Admin",
                    },
                    autoSave: true
                );
            }

            var superAdminDetails = await _roleRepository.FirstOrDefaultAsync(x => x.Name == "Super Admin");
            if (superAdminDetails == null)
            {
                await _roleRepository.InsertAsync(
                   new Role
                   {
                       Name = "Super Admin",
                   },
                   autoSave: true
               );
            }

            var governorDetails = await _roleRepository.FirstOrDefaultAsync(x => x.Name == "Governor");
            if (governorDetails == null)
            {
                await _roleRepository.InsertAsync(
                   new Role
                   {
                       Name = "Governor",
                   },
                   autoSave: true
               );
            }

            var companyDetails = await _roleRepository.FirstOrDefaultAsync(x => x.Name == "Company");
            if (companyDetails == null)
            {
                await _roleRepository.InsertAsync(
                   new Role
                   {
                       Name = "Company",
                   },
                   autoSave: true
               );
            }
        }

        /// <summary>
        /// Method to seed super admin details.
        /// </summary>
        /// <returns>Task.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task SeedSuperAdminAsync()
        {
            var superAdminRole = await _roleRepository.FirstOrDefaultAsync(x => x.Name == "Super Admin");

            string superAdminEmail = "vasuperuser@mailinator.com";
            string superAdminFirstName = "VaSuper";
            string superAdminLastName = "Admin";
            // Checks the user email id is already present or not.
            var adminDetails = await _userRepository.FirstOrDefaultAsync(x => x.Email == superAdminEmail);
            if (adminDetails == null)
            {
                UserDetail userDetail = new UserDetail();
                userDetail.Email = superAdminEmail;
                userDetail.FirstName = superAdminFirstName;
                userDetail.LastName = superAdminLastName;

                UserDetail userResult = await _userRepository.InsertAsync(userDetail, autoSave: true);
                if (userResult.Id != Guid.Empty)
                {
                    // Add the user details and role mapping.
                    UserDetailRoleMapping userDetailRoleMapping = new UserDetailRoleMapping();
                    userDetailRoleMapping.RoleId = superAdminRole != null ? superAdminRole.Id : Guid.Empty;
                    userDetailRoleMapping.UserId = userResult.Id;
                    var userRoleResult = await _userRoleRepository.InsertAsync(userDetailRoleMapping, autoSave: true);

                }
            }
            



            // Second Admin
            string superAdminEmail2 = "saber@virtualaid.nl";
            string superAdminFirstName2 = "Saber";
            string superAdminLastName2 = "Saber";
            // Checks the user email id is already present or not.
            var adminDetails2 = await _userRepository.FirstOrDefaultAsync(x => x.Email == superAdminEmail2);
            if (adminDetails2 == null)
            {
                var userDetail2 = new UserDetail();
                userDetail2.Email = superAdminEmail2;
                userDetail2.FirstName = superAdminFirstName2;
                userDetail2.LastName = superAdminLastName2;

                UserDetail userResult2 = await _userRepository.InsertAsync(userDetail2, autoSave: true);
                if (userResult2.Id != Guid.Empty)
                {
                    // Add the user details and role mapping.
                    UserDetailRoleMapping userDetailRoleMapping = new UserDetailRoleMapping();
                    userDetailRoleMapping.RoleId = superAdminRole != null ? superAdminRole.Id : Guid.Empty;
                    userDetailRoleMapping.UserId = userResult2.Id;
                    var userRoleResult = await _userRoleRepository.InsertAsync(userDetailRoleMapping, autoSave: true);
                }
            }
            

            // Third Admin
            string superAdminEmail3 = "info@virtualaid.nl";
            string superAdminFirstName3 = "Info";
            string superAdminLastName3 = "Info";
            // Checks the user email id is already present or not.
            var adminDetails3 = await _userRepository.FirstOrDefaultAsync(x => x.Email == superAdminEmail3);
            if (adminDetails3 == null)
            {
                var userDetail3 = new UserDetail();
                userDetail3.Email = superAdminEmail3;
                userDetail3.FirstName = superAdminFirstName3;
                userDetail3.LastName = superAdminLastName3;

                UserDetail userResult3 = await _userRepository.InsertAsync(userDetail3, autoSave: true);
                if (userResult3.Id != Guid.Empty)
                {
                    // Add the user details and role mapping.
                    UserDetailRoleMapping userDetailRoleMapping = new UserDetailRoleMapping();
                    userDetailRoleMapping.RoleId = superAdminRole != null ? superAdminRole.Id : Guid.Empty;
                    userDetailRoleMapping.UserId = userResult3.Id;
                    var userRoleResult = await _userRoleRepository.InsertAsync(userDetailRoleMapping, autoSave: true);
                }
            }
            

            // Fourth Admin
            string superAdminEmail4 = "soumia@virtualaid.nl";
            string superAdminFirstName4 = "Soumia";
            string superAdminLastName4 = "Soumia";
            // Checks the user email id is already present or not.
            var adminDetails4 = await _userRepository.FirstOrDefaultAsync(x => x.Email == superAdminEmail4);
            if (adminDetails4 == null)
            {
                var userDetail4 = new UserDetail();
                userDetail4.Email = superAdminEmail4;
                userDetail4.FirstName = superAdminFirstName4;
                userDetail4.LastName = superAdminLastName4;

                UserDetail userResult4 = await _userRepository.InsertAsync(userDetail4, autoSave: true);
                if (userResult4.Id != Guid.Empty)
                {
                    // Add the user details and role mapping.
                    UserDetailRoleMapping userDetailRoleMapping = new UserDetailRoleMapping();
                    userDetailRoleMapping.RoleId = superAdminRole != null ? superAdminRole.Id : Guid.Empty;
                    userDetailRoleMapping.UserId = userResult4.Id;
                    var userRoleResult = await _userRoleRepository.InsertAsync(userDetailRoleMapping, autoSave: true);
                }
            }
            

            // Fifth Admin
            string superAdminEmail5 = "arnold@jasny.net";
            string superAdminFirstName5 = "Arnold";
            string superAdminLastName5 = "Arnold";
            // Checks the user email id is already present or not.
            var adminDetails5 = await _userRepository.FirstOrDefaultAsync(x => x.Email == superAdminEmail5);
            if (adminDetails5 == null)
            {
                var userDetail5 = new UserDetail();
                userDetail5.Email = superAdminEmail5;
                userDetail5.FirstName = superAdminFirstName5;
                userDetail5.LastName = superAdminLastName5;

                UserDetail userResult5 = await _userRepository.InsertAsync(userDetail5, autoSave: true);
                if (userResult5.Id != Guid.Empty)
                {
                    // Add the user details and role mapping.
                    UserDetailRoleMapping userDetailRoleMapping = new UserDetailRoleMapping();
                    userDetailRoleMapping.RoleId = superAdminRole != null ? superAdminRole.Id : Guid.Empty;
                    userDetailRoleMapping.UserId = userResult5.Id;
                    var userRoleResult = await _userRoleRepository.InsertAsync(userDetailRoleMapping, autoSave: true);
                }
            }
            
        }

        /// <summary>
        /// Method to seed course type price.
        /// </summary>
        /// <returns>Task.</returns>
        private async Task SeedCourseTypeWithPriceAsync()
        {
            var PriceOfOnlineCourse = await _coursePriceRepository.FirstOrDefaultAsync(c => c.Name == "Online");
            if(PriceOfOnlineCourse == null)
            {
                await _coursePriceRepository.InsertAsync(new CourseTypePrice
                {
                    Name = "Online",
                    Price = 50
                }, autoSave: true);
            }

            var PriceOfVRCourse = await _coursePriceRepository.FirstOrDefaultAsync(c => c.Name == "VR");
            if (PriceOfVRCourse == null)
            {
                await _coursePriceRepository.InsertAsync(new CourseTypePrice
                {
                    Name = "VR",
                    Price = 100
                }, autoSave: true);
            }

            var PriceOfLiveCourse = await _coursePriceRepository.FirstOrDefaultAsync(c => c.Name == "Live");
            if (PriceOfLiveCourse == null)
            {
                await _coursePriceRepository.InsertAsync(new CourseTypePrice
                {
                    Name = "Live",
                    Price = 150
                }, autoSave: true);
            }
        }
    }
}