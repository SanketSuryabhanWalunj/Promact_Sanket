namespace VirtaulAid.Permissions;

public static class VirtaulAidPermissions
{
    // This is a provider name.
    public const string GroupName = "VirtaulAid";

    //Add your own permission names. Example:
    //public const string MyPermission1 = GroupName + ".MyPermission1";

    public static class User
    {
        public const string Default = GroupName + ".User";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Company
    {
        public const string Default = GroupName + ".Company";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Course
    {
        public const string Default = GroupName + ".Course";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Module
    {
        public const string Default = GroupName + ".Module";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Lesson
    {
        public const string Default = GroupName + ".Lesson";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Content
    {
        public const string Default = GroupName + ".Content";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Employee
    {
        public const string Default = GroupName + ".Employee";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Exam
    {
        public const string Default = GroupName + ".Exam";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Role
    {
        public const string Default = GroupName + ".Role";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Purchase
    {
        public const string Default = GroupName + ".Purchase";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Otp
    {
        public const string Default = GroupName + ".Otp";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class Cart
    {
        public const string Default = GroupName + ".Cart";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class UserEnrollment
    {
        public const string Default = GroupName + ".UserEnrollment";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
    public static class CourseSubscription
    {
        public const string Default = GroupName + ".CourseSubscription";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }

    public static class LiveExam
    {
        public const string Default = GroupName + ".LiveExam";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
}
