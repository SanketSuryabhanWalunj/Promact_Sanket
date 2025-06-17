import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AuthInterceptor } from 'src/Services/auth.interceptor';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CourseComponent } from './dashboard/course/course.component';
import { InternTableComponent } from './dashboard/intern-table/intern-table.component';
import { JournalComponent } from './dashboard/journal/journal.component';
import { TemplateJournalComponent } from './dashboard/template-journal/template-journal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminTableComponent } from './dashboard/admin-table/admin-table.component';
import { TemplateTableComponent } from './dashboard/template-table/template-table.component';
import { LoaderComponent } from './loader/loader.component';
import { CourseDetailsComponent } from './dashboard/course/course-details/course-details.component';
import { LoaderTableComponent } from './dashboard/loader-table/loader-table.component';
import { InternProfileComponent } from './dashboard/intern-table/intern-profile/intern-profile.component';
import { InternDashboardComponent } from './dashboard/intern-dashboard/intern-dashboard.component';
import { AlertToasterComponent } from './alert-toaster/alert-toaster.component';
import { InternshipsComponent } from './dashboard/internships/internships.component';
import { InternHistoryComponent } from './dashboard/intern-history/intern-history.component';
import { OrganizationTableComponent } from './dashboard/organization-table/organization-table.component';
import { HistoryDetailsComponent } from './dashboard/history-details/history-details.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
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
import { PunchRecordsDetailsComponent } from './dashboard/punch-records-details/punch-records-details.component';
import { InternAttendanceDetailsComponent } from './dashboard/intern-attendance-details/intern-attendance-details.component';
import { AdminInternAttendanceDetailsComponent } from './dashboard/admin-intern-attendance-details/admin-intern-attendance-details.component';
import { InternLeaveRequestComponent } from './dashboard/intern-leave-request/intern-leave-request.component';
import { AdminHolidayDetailsComponent } from './dashboard/admin-holiday-details/admin-holiday-details.component';
import { SharedModule } from './shared/components/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    DashboardComponent,
    CourseComponent,
    InternTableComponent,
    JournalComponent,
    TemplateJournalComponent,
    TemplateTableComponent,
    AdminTableComponent,
    LoaderComponent,
    CourseDetailsComponent,
    LoaderTableComponent,
    InternProfileComponent,
    InternDashboardComponent,
    AlertToasterComponent,
    InternshipsComponent,
    InternHistoryComponent,
    OrganizationTableComponent,
    HistoryDetailsComponent,
    AdminInternHistoryComponent,
    InternBatchComponent,
    ScoreboardComponent,
    InternInternshipComponent,
    InternLeaveRequestComponent,
    InternLeaveApplicationComponent,
    AdminInternsLeaveRequestComponent,
    InternshipFeedbackComponent,
    ScoreDetailsComponent,
    BehaviouralTemplateComponent,
    BehaviouralTemplateTableComponent,
    BehaviourFeedbackComponent,
    CreatePasswordComponent,
    MentorDashboardComponent,
    FeedbackDashboardComponent,
    FeedbackDetailsComponent,
    CareerPathTableComponent,
    BugsAndFeedbacksComponent,
    OverallFeedbackComponent,
    PunchRecordsDetailsComponent,
    InternAttendanceDetailsComponent,
    AdminInternAttendanceDetailsComponent,
    AdminHolidayDetailsComponent,
    AlertDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    DragDropModule,
    SharedModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
