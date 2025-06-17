import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { LoaderTableService } from '../loader-table/loader-table.service';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css'],
})
export class JournalComponent implements OnInit {
  journalForm!: FormGroup;
  topics: any[] = [];
  topicId: any = '';
  page: string = '';
  topicNames: any[] = [];
  topicNotes: any[] = [];
  topicDescription: any[] = [];
  internshipId: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private alert: AlertToasterService,
    private loader: LoaderTableService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.topicId = param['id'];
      this.page = param['page'];
      this.internshipId = param['internshipId'];
    });
    this.initializeForm();
    this.getTopicList();
  }

  initializeForm() {
    this.journalForm = this.formBuilder.group({
      options: this.formBuilder.array([]),
    });
  }

  createTopicFormGroup(
    topicName: string,
    notes: string,
    description: string
  ): FormGroup {
    return this.formBuilder.group({
      topicName: [topicName, Validators.required],
      notes: [notes],
      description: [description],
    });
  }

  get optionsArray() {
    return this.journalForm.get('options') as FormArray;
  }

  addTopic(topicName: string, notes: string, description: string) {
    this.optionsArray.push(
      this.createTopicFormGroup(topicName, notes, description)
    );
  }

  getTopicList() {
    this.loader.showLoader();
    this.userService
      .getData(`JournalTemplate/GetTemplate?topicId=${this.topicId}&internshipId=${this.internshipId}`)
      .subscribe((res) => {
        this.topics = res.map((topic: any) => {
          return {
            topicName: topic.topicName,
            topicNotes: topic.notes,
            topicDescription: topic.description,
          };
        });
        this.topicNames = this.topics.map((topic: any) => topic.topicName);
        this.topicNotes = this.topics.map((topic: any) => topic.topicNotes);
        this.topicDescription = this.topics.map(
          (topic: any) => topic.topicDescription
        );

        this.topics.forEach((topic: any) => {
          this.addTopic(
            topic.topicName,
            topic.topicNotes,
            topic.topicDescription
          );
        });
        this.loader.hideLoader();
      });
  }

  submit(data: any) {
    this.loader.showLoader();
    data.topicId = this.topicId;
    data.internshipId = this.internshipId;
    this.userService
      .postData('Journal/daily-journal', data)
      .subscribe((res) => {
        this.loader.hideLoader();
        if (res) {
          this.alert.success('Journal Successfully saved');
          if (this.page == 'home') {
            this.router.navigate(['/dashboard/home'], { replaceUrl: true });
          } else {
            this.router.navigate(['/dashboard/history/details'], {
              queryParams: {
                id: res.id,
                topicId: res.topic_Id,
              },
              fragment: 'journal',
            });
          }
        }
      });
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.overflow = 'hidden';
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
