import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InternTableComponent } from './dashboard/intern-table/intern-table.component';
import { CourseComponent } from './dashboard/course/course.component';
import { JournalComponent } from './dashboard/journal/journal.component';
import { TemplateJournalComponent } from './dashboard/template-journal/template-journal.component';
import { TemplateTableComponent } from './dashboard/template-table/template-table.component';
import { AdminTableComponent } from './dashboard/admin-table/admin-table.component';
import { authGuard } from './shared/auth.guard';
import { roleGuard } from './shared/role.guard';
import { CourseDetailsComponent } from './dashboard/course/course-details/course-details.component';
import { InternProfileComponent } from './dashboard/intern-table/intern-profile/intern-profile.component';
import { InternDashboardComponent } from './dashboard/intern-dashboard/intern-dashboard.component';
import { InternHistoryComponent } from './dashboard/intern-history/intern-history.component';
import { OrganizationTableComponent } from './dashboard/organization-table/organization-table.component';
import { HistoryDetailsComponent } from './dashboard/history-details/history-details.component';
import { InternshipsComponent } from './dashboard/internships/internships.component';
import { AdminInternHistoryComponent } from './dashboard/admin-intern-history/admin-intern-history.component';
import { InternBatchComponent } from './dashboard/intern-batch/intern-batch.component';
import { ScoreboardComponent } from './dashboard/scoreboard/scoreboard.component';
import { InternInternshipComponent } from './dashboard/intern-internship/intern-internship.component';
import { InternLeaveApplicationComponent } from './dashboard/intern-leave-application/intern-leave-application.component';
import { AdminInternsLeaveRequestComponent } from './dashboard/admin-interns-leave-request/admin-interns-leave-request.component';
import { InternshipFeedbackComponent } from './dashboard/internship-feedback/internship-feedback.component';
import { ScoreDetailsComponent } from './dashboard/score-details/score-details.component';
import { BehaviouralTemplateComponent } from './dashboard/behavioural-template/behavioural-template.component';
import { BehaviouralTemplateTableComponent } from './dashboard/behavioural-template-table/behavioural-template-table.component';
import { BehaviourFeedbackComponent } from './dashboard/behaviour-feedback/behaviour-feedback.component';
import { CreatePasswordComponent } from './pages/create-password/create-password.component';
import { MentorDashboardComponent } from './dashboard/mentor-dashboard/mentor-dashboard.component';
import { FeedbackDashboardComponent } from './dashboard/feedback-dashboard/feedback-dashboard.component';
import { FeedbackDetailsComponent } from './dashboard/feedback-details/feedback-details.component';
import { CareerPathTableComponent } from './dashboard/career-path-table/career-path-table.component';
import { BugsAndFeedbacksComponent } from './dashboard/bugs-and-feedbacks/bugs-and-feedbacks.component';
import { OverallFeedbackComponent } from './dashboard/overall-feedback/overall-feedback.component';
import { InternAttendanceDetailsComponent } from './dashboard/intern-attendance-details/intern-attendance-details.component';
import { AdminInternAttendanceDetailsComponent } from './dashboard/admin-intern-attendance-details/admin-intern-attendance-details.component';
import { PunchRecordsDetailsComponent } from './dashboard/punch-records-details/punch-records-details.component';
import { InternLeaveRequestComponent } from './dashboard/intern-leave-request/intern-leave-request.component';
import { AdminHolidayDetailsComponent } from './dashboard/admin-holiday-details/admin-holiday-details.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: InternTableComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'intern/:index',
        component: InternProfileComponent,
      },
      {
        path: 'home',
        component: InternDashboardComponent,
        canActivate: [roleGuard],
        data: { role: 'Intern' },
      },
      {
        path: 'history',
        component: InternHistoryComponent,
        canActivate: [roleGuard],
        data: { role: 'Intern' },
      },
      {
        path: 'admin-holiday',
        component: AdminHolidayDetailsComponent,
        canActivate: [roleGuard],
        data: { role: 'SuperAdmin' },
      },
      {
        path: 'history/details',
        component: HistoryDetailsComponent,
      },
      {
        path: 'courses',
        component: CourseComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'courses/:id',
        component: CourseDetailsComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'template',
        component: TemplateTableComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'admin',
        component: AdminTableComponent,
        canActivate: [roleGuard],
        data: { role: 'SuperAdmin' },
      },
      {
        path: 'view-journal/:page/:id/:internshipId',
        component: JournalComponent,
        canActivate: [roleGuard],
        data: { role: 'Intern' },
      },
      {
        path: 'journal-template',
        component: TemplateTableComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'journal-template/create',
        component: TemplateJournalComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'journal-template/edit/:id',
        component: TemplateJournalComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'internships',
        component: InternshipsComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'intern-interships',
        component: InternInternshipComponent,
        canActivate: [roleGuard],
        data: { role: 'Intern' },
      },
      {
        path: 'internships/:internshipId',
        component: AdminInternHistoryComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'organization',
        component: OrganizationTableComponent,
      },
      {
        path: 'internbatch',
        component: InternBatchComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'scoreboard',
        component: ScoreboardComponent,
        // canActivate: [roleGuard],
        // data: { role: 'Admin' }
      },
      {
        path: 'intern-leave-application',
        component: InternLeaveApplicationComponent,
        canActivate: [roleGuard],
        data: { role: 'Intern' },
      },
      {
        path: 'intern-leave-application/intern-leave-request',
        component: InternLeaveRequestComponent,
        canActivate: [roleGuard],
        data: { role: 'Intern' },
      },

      {
        path: 'leave-application',
        component: AdminInternsLeaveRequestComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'feedback',
        component: InternshipFeedbackComponent,
      },
      {
        path: 'scoreboard/:id',
        component: ScoreDetailsComponent,
        // canActivate: [roleGuard],
        // data: { role: 'Admin' }
      },
      {
        path: 'behaviour-table-template',
        component: BehaviouralTemplateTableComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'behaviour-template/create',
        component: BehaviouralTemplateComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'behaviour-template/edit/:id',
        component: BehaviouralTemplateComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'behaviour-feedback',
        component: BehaviourFeedbackComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'mentor-dashboard',
        component: MentorDashboardComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'feedback-dashboard',
        component: FeedbackDashboardComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'feedback-detail',
        component: FeedbackDetailsComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'feedback-detail/:id',
        component: FeedbackDetailsComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'bugs-and-feedback',
        component: BugsAndFeedbacksComponent,
      },
      {
        path: 'career-paths',
        component: CareerPathTableComponent,
        canActivate: [roleGuard],
        data: { role: 'SuperAdmin' },
      },
      {
        path: 'overall-feedback',
        component: OverallFeedbackComponent,
        canActivate: [roleGuard],
        data: { role: 'Intern' },
      },
      {
        path: 'punch-records-details',
        component: PunchRecordsDetailsComponent,
        canActivate: [roleGuard],
        data: { role: 'Intern' },
      },
      {
        path: 'punch-records-details/intern-attendance-details',
        component: InternAttendanceDetailsComponent,
        canActivate: [roleGuard],
        data: { role: 'Intern' },
      },
      {
        path: 'admin-intern-attendance-details',
        component: AdminInternAttendanceDetailsComponent,
        canActivate: [roleGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'punch-records-details/intern-attendance-details/:date',
        component: InternAttendanceDetailsComponent,
        canActivate: [roleGuard],
        data: { role: 'Intern' },
      }
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'create-password',
    component: CreatePasswordComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
