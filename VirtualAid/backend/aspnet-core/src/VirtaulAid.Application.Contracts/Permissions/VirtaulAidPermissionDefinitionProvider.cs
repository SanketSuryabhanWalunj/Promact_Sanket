using VirtaulAid.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace VirtaulAid.Permissions;

public class VirtaulAidPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        //Define your own permissions here. Example:
        //myGroup.AddPermission(VirtaulAidPermissions.MyPermission1, L("Permission:MyPermission1"));

        var virtualAidGroup = context.AddGroup(VirtaulAidPermissions.GroupName, L("Permission:VirtualAid"));

        var usersPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.User.Default, L("Permission:User"));
        usersPermission.AddChild(VirtaulAidPermissions.User.Create, L("Permission:User.Create"));
        usersPermission.AddChild(VirtaulAidPermissions.User.Edit, L("Permission:User.Edit"));
        usersPermission.AddChild(VirtaulAidPermissions.User.Delete, L("Permission:User.Delete"));

        var companiesPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Company.Default, L("Permission:Company"));
        companiesPermission.AddChild(VirtaulAidPermissions.Company.Create, L("Permission:Company.Create"));
        companiesPermission.AddChild(VirtaulAidPermissions.Company.Edit, L("Permission:Company.Edit"));
        companiesPermission.AddChild(VirtaulAidPermissions.Company.Delete, L("Permission:Company.Delete"));

        var coursesPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Course.Default, L("Permission:Course"));
        coursesPermission.AddChild(VirtaulAidPermissions.Course.Create, L("Permission:Course.Create"));
        coursesPermission.AddChild(VirtaulAidPermissions.Course.Edit, L("Permission:Course.Edit"));
        coursesPermission.AddChild(VirtaulAidPermissions.Course.Delete, L("Permission:Course.Delete"));

        var modulesPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Module.Default, L("Permission:Module"));
        modulesPermission.AddChild(VirtaulAidPermissions.Module.Create, L("Permission:Module.Create"));
        modulesPermission.AddChild(VirtaulAidPermissions.Module.Edit, L("Permission:Module.Edit"));
        modulesPermission.AddChild(VirtaulAidPermissions.Module.Delete, L("Permission:Module.Delete"));

        var lessonsPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Lesson.Default, L("Permission:Lesson"));
        lessonsPermission.AddChild(VirtaulAidPermissions.Lesson.Create, L("Permission:Lesson.Create"));
        lessonsPermission.AddChild(VirtaulAidPermissions.Lesson.Edit, L("Permission:Lesson.Edit"));
        lessonsPermission.AddChild(VirtaulAidPermissions.Lesson.Delete, L("Permission:Lesson.Delete"));

        var contentsPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Content.Default, L("Permission:Content"));
        contentsPermission.AddChild(VirtaulAidPermissions.Content.Create, L("Permission:Content.Create"));
        contentsPermission.AddChild(VirtaulAidPermissions.Content.Edit, L("Permission:Content.Edit"));
        contentsPermission.AddChild(VirtaulAidPermissions.Content.Delete, L("Permission:Content.Delete"));

        var employeesPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Employee.Default, L("Permission:Employee"));
        employeesPermission.AddChild(VirtaulAidPermissions.Employee.Create, L("Permission:Employee.Create"));
        employeesPermission.AddChild(VirtaulAidPermissions.Employee.Edit, L("Permission:Employee.Edit"));
        employeesPermission.AddChild(VirtaulAidPermissions.Employee.Delete, L("Permission:Employee.Delete"));

        var examsPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Exam.Default, L("Permission:Exam"));
        examsPermission.AddChild(VirtaulAidPermissions.Exam.Create, L("Permission:Exam.Create"));
        examsPermission.AddChild(VirtaulAidPermissions.Exam.Edit, L("Permission:Exam.Edit"));
        examsPermission.AddChild(VirtaulAidPermissions.Exam.Delete, L("Permission:Exam.Delete"));

        var rolesPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Role.Default, L("Permission:Role"));
        rolesPermission.AddChild(VirtaulAidPermissions.Role.Create, L("Permission:Role.Create"));
        rolesPermission.AddChild(VirtaulAidPermissions.Role.Edit, L("Permission:Role.Edit"));
        rolesPermission.AddChild(VirtaulAidPermissions.Role.Delete, L("Permission:Role.Delete"));

        var purchasesPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Purchase.Default, L("Permission:Purchase"));
        purchasesPermission.AddChild(VirtaulAidPermissions.Purchase.Create, L("Permission:Purchase.Create"));
        purchasesPermission.AddChild(VirtaulAidPermissions.Purchase.Edit, L("Permission:Purchase.Edit"));
        purchasesPermission.AddChild(VirtaulAidPermissions.Purchase.Delete, L("Permission:Purchase.Delete"));

        var OtpsPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Otp.Default, L("Permission:Otp"));
        OtpsPermission.AddChild(VirtaulAidPermissions.Otp.Create, L("Permission:Otp.Create"));
        OtpsPermission.AddChild(VirtaulAidPermissions.Otp.Edit, L("Permission:Otp.Edit"));
        OtpsPermission.AddChild(VirtaulAidPermissions.Otp.Delete, L("Permission:Otp.Delete"));

        var cartsPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.Cart.Default, L("Permission:Cart"));
        cartsPermission.AddChild(VirtaulAidPermissions.Cart.Create, L("Permission:Cart.Create"));
        cartsPermission.AddChild(VirtaulAidPermissions.Cart.Edit, L("Permission:Cart.Edit"));
        cartsPermission.AddChild(VirtaulAidPermissions.Cart.Delete, L("Permission:Cart.Delete"));

        var userEnrollmentsPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.UserEnrollment.Default, L("Permission:UserEnrollment"));
        userEnrollmentsPermission.AddChild(VirtaulAidPermissions.UserEnrollment.Create, L("Permission:UserEnrollment.Create"));
        userEnrollmentsPermission.AddChild(VirtaulAidPermissions.UserEnrollment.Edit, L("Permission:UserEnrollment.Edit"));
        userEnrollmentsPermission.AddChild(VirtaulAidPermissions.UserEnrollment.Delete, L("Permission:UserEnrollment.Delete"));

        var courseSubscriptionsPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.CourseSubscription.Default, L("Permission:CourseSubscription"));
        courseSubscriptionsPermission.AddChild(VirtaulAidPermissions.CourseSubscription.Create, L("Permission:CourseSubscription.Create"));
        courseSubscriptionsPermission.AddChild(VirtaulAidPermissions.CourseSubscription.Edit, L("Permission:CourseSubscription.Edit"));
        courseSubscriptionsPermission.AddChild(VirtaulAidPermissions.CourseSubscription.Delete, L("Permission:CourseSubscription.Delete"));

        var liveExamPermission = virtualAidGroup.AddPermission(VirtaulAidPermissions.LiveExam.Default, L("Permission:LiveExam"));
        liveExamPermission.AddChild(VirtaulAidPermissions.LiveExam.Create, L("Permission:LiveExam.Create"));
        liveExamPermission.AddChild(VirtaulAidPermissions.LiveExam.Edit, L("Permission:LiveExam.Edit"));
        liveExamPermission.AddChild(VirtaulAidPermissions.LiveExam.Delete, L("Permission:LiveExam.Delete"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<VirtaulAidResource>(name);
    }
}
