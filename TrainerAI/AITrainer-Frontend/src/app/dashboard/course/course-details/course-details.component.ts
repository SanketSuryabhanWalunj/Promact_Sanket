import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { LoaderService } from 'src/app/loader/loader.service';
import {
  Assignment,
  AssignmentEdit,
  Content,
  GradingCriteria,
  Intructions,
  PartDetails,
  Quiz,
  courseDetailList,
  createTemplate,
} from 'src/app/model/Course';
import { LoaderTableService } from '../../loader-table/loader-table.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { StringConstant } from 'src/app/model/string-constants';
import { StringConstants } from 'src/app/shared/string-constants';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css'],
})
export class CourseDetailsComponent implements OnInit {
  selectedCourseDetails!: courseDetailList;
  templateList: any;
  selectJournal!: FormGroup;
  createTemplate!: createTemplate;
  editJournal!: FormGroup;
  Addbody: any;
  createAssignmentForm!: FormGroup;
  formHeading!: string;
  createAssignment: boolean = false;
  topicId: any;
  newCourseId: any;
  EditTopicForm!: FormGroup;
  storeTopicId!: string;
  storeTopicDuration!: number;
  storeTopicName!: string;
  rearrange!: boolean;
  deleteTopicId!: string;
  deleteTopicDuration!: number;
  updateTopicIndex!: number;
  EditQuizForm!: FormGroup;
  storeQuizId!: string;
  storeQuizQuestion!: string;
  deleteQuizId!: string;
  AddQuizForm!: FormGroup;
  topicIdForQuiz!: string;
  EditAssignmentForm!: FormGroup;
  storeAssignmentId!: string;
  deleteAssignmentId!: string;
  storeAssignmentGrade: GradingCriteria[] = [];
  storeAssignmentPoints: Intructions[] = [];
  selectedAssignmentInstructions: any;
  selectedAssignmentPercentage: any;
  selectedAssignmentPart: any;
  topicIdForAssignment!: string;
  AddAssignmentForm!: FormGroup;
  addduration: boolean = false;
  AddPartForm!: FormGroup;
  assignmentPartsArray: any[] = [];
  assignmentGradingArray: any[] = [];
  assignmentArrayPart: any[] = [];
  totalPercentage: any = 0;
  percentageLimit: boolean = false;
  remainingpartCount: any;
  warningPart: boolean = false;
  showQuizLinkConfirmationModel: boolean = false;
  updateTopicId!: string;
  assignment: any;
  editPartAssignmentArray: AssignmentEdit[] = [];
  editArray: any;
  partDetails: any[] = [];
  editAssignmentMode: boolean = false;
  show: boolean = false;
  editQuizDuration!: FormGroup;
  selectedcourseQuiztime!: number;
  constantString = StringConstants;
  readonly TemplateDeleteSuccess = StringConstant.templateDeleteSuccess;
  readonly AreYousureText = StringConstant.areYousureText;
  readonly Close = StringConstant.close;
  readonly Delete = StringConstant.delete;
  readonly DeleteTopic = StringConstant.deleteTopic;
  readonly DeleteQuestion = StringConstant.deleteQuestion;
  readonly DeleteJournal = StringConstant.deleteJournal;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private tableLoader: LoaderTableService,
    private loader: LoaderService,
    private userService: UserService,
    private alert: AlertToasterService
  ) {
    this.createTemplate = {
      courseId: '',
      templateId: '',
    };
    this.rearrange = false;
  }
  ngOnInit(): void {
    this.showQuizLinkConfirmationModel = false;
    this.getselectedCourseDetails();
    this.initAssignJournal();
    this.initEditJournal();
    this.getJournalTemplate();
    this.initAssignmentForm();
    this.initEditTopic();
    this.initEditQuiz();
    this.initAddQuiz();
    this.initEditAssignment();
    this.initAddAssignment();
    this.initaddPartForm();
    this.initEditCourse();
  }

  initaddPartForm() {
    this.AddPartForm = this.formBuilder.group(
      {
        partNo: [null, [Validators.required, this.uniquePartNumberValidator()]],
        partNote: ['', Validators.required],
        partPercentage: [
          null,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
      },
      {
        validators: [this.partPercentageValidator(100)],
      }
    );
  }
  initAssignmentForm() {
    this.createAssignmentForm = this.formBuilder.group({
      // courseduration: ['', Validators.required],
      courseduration: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      marks: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      addduration: [false],
    });
  }

  initAssignJournal() {
    this.selectJournal = this.formBuilder.group({
      template: ['', Validators.required],
    });
  }

  initEditJournal() {
    this.editJournal = this.formBuilder.group({
      template: ['', Validators.required],
    });
  }
  initEditCourse() {
    this.editQuizDuration = this.formBuilder.group({
      quizDurations: ['', Validators.required],
    });
  }

  initEditTopic() {
    this.EditTopicForm = this.formBuilder.group({
      topicId: '',
      topicName: ['', Validators.required],
      duration: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  initEditQuiz() {
    this.EditQuizForm = this.formBuilder.group({
      quizId: '',
      question: ['', Validators.required],
      option1: ['', Validators.required],
      option2: ['', Validators.required],
      option3: ['', Validators.required],
      option4: ['', Validators.required],
      answer: ['', Validators.required],
      editMarks: ['', Validators.required],
    });
  }

  /**
   * method to initialize quiz fields
   *@returns void
   */
  initAddQuiz(): void {
    this.AddQuizForm = this.formBuilder.group({
      topicId: '',
      addQuestion: ['', Validators.required],
      addOption1: ['', Validators.required],
      addOption2: ['', Validators.required],
      addOption3: ['', Validators.required],
      addOption4: ['', Validators.required],
      addAnswer: ['', Validators.required],
      addMarks: ['', Validators.required],
    });
  }

  initEditAssignment() {
    this.EditAssignmentForm = this.formBuilder.group({
      assignmentId: '',
      assignmentName: ['', Validators.required],
      assignmentPoint: [null, Validators.required],
      assignmentMarks: ['', Validators.required],
      assignmentNote: ['', Validators.required],
      percentage: ['', Validators.required],
    });
  }

  initAddAssignment() {
    this.AddAssignmentForm = this.formBuilder.group({
      assignmentId: '',
      assignmentName: ['', Validators.required],
      objective: ['', Validators.required],
      assignmentMarks: ['', Validators.required],
      adddurations: [false],
      assignmentDuration: ['', Validators.required],
    });
  }

  getselectedCourseDetails() {
    this.loader.showLoader();
    this.activatedRoute.params.subscribe((param) => {
      this.getCourseDetailList(param['id']);
    });
    this.loader.hideLoader();
  }

  getCourseDetailList(courseId: string) {
    this.tableLoader.showLoader();
    this.userService
      .getData(`Course/GetCourseDetail?courseId=${courseId}`)
      .subscribe(
        (res: courseDetailList) => {
          this.selectedCourseDetails = res;
          this.selectedcourseQuiztime = res.quizTime;
          this.tableLoader.hideLoader();
        },
        (error) => {
          console.error(error);
          this.tableLoader.hideLoader();
        }
      );
  }

  getJournalTemplate() {
    this.tableLoader.showLoader();
    this.userService
      .getData(`JournalTemplate/GetTemplateList`)
      .subscribe((res) => {
        this.templateList = res.message;
        this.selectJournal.get('template')?.setValue(this.templateList[0].templateId);
      });
    this.tableLoader.hideLoader();
  }

  setTemplate(data: any) {
    this.createTemplate = {
      courseId: this.selectedCourseDetails.id,
      templateId: data.template,
    };
    this.tableLoader.showLoader();
    this.userService
      .changeData(`Course/CreateTemplate`, this.createTemplate)
      .subscribe((res) => {
        if (res.message) {
          this.getCourseDetailList(this.selectedCourseDetails.id);
          this.selectJournal.reset();
          this.tableLoader.hideLoader();
        }
      });
  }

  editQuizDetails(data: any) {
    const body = {
      QuizDuration: data.quizDurations,
      courseId: this.selectedCourseDetails.id,
    };
    this.tableLoader.showLoader();
    this.userService.changeData(`Course/EditQuizDuration`, body).subscribe((res) => {
      if (res) {
        this.tableLoader.hideLoader();
        this.getCourseDetailList(this.selectedCourseDetails.id);
        this.selectedCourseDetails.quizTime = data.quizDurations;
        this.tableLoader.hideLoader();
      }
    });
  }
  getJournalTemplateEdit(templateid: string) {
    this.userService
      .getData(`JournalTemplate/GetTemplateList`)
      .subscribe((res) => {
        this.templateList = res.message;
        this.editJournal.get('template')?.setValue(this.templateList[0].templateId);
      });
  }

  getCourseEdit(courseId: string) {
    this.editQuizDuration.patchValue({
      quizDurations: this.selectedcourseQuiztime,
    });
  }

  deleteTemplate(templateId: string | null) {
    this.userService
      .deleteData(`Course/DeleteTemplate?templateId=${templateId}`)
      .subscribe((res) => {
        if (res) {
          this.getCourseDetailList(this.selectedCourseDetails.id);
        }
      });
  }

  toggleassignmentform(id: string) {
    this.topicId = id;
    this.initAssignmentForm();
  }

  getTopicDetail(topicId: string, topicName: string, duration: number) {
    this.assignmentArrayPart = [];
    this.assignmentPartsArray = [];
    this.assignmentGradingArray = [];
    this.AddAssignmentForm.reset({
      assignmentId: '',
      assignmentName: '',
      objective: '',
      assignmentMarks: '',
      adddurations: false,
      assignmentDuration: '',
    });
    this.AddPartForm.reset();
    this.tableLoader.showLoader();
    this.EditTopicForm.patchValue({
      topicName: topicName,
      duration: duration,
    });
    this.storeTopicId = topicId;
    this.storeTopicName = topicName;
    this.storeTopicDuration = duration;
    this.tableLoader.hideLoader();
  }

  editTopic(data: any) {
    this.tableLoader.showLoader();
    data.topicId = this.storeTopicId;
    this.userService.changeData(`Topic/EditTopic`, data).subscribe((res) => {
      if (res.topicEditResponseDto) {
        const index = this.selectedCourseDetails.topics.findIndex(
          (topics) => topics.id === res.topicEditResponseDto.topicId
        );
        if (index !== -1) {
          this.selectedCourseDetails.topics[index].topicName =
            res.topicEditResponseDto.topicName;
          this.selectedCourseDetails.topics[index].duration =
            res.topicEditResponseDto.topicDuration;
          this.selectedCourseDetails.duration =
            res.topicEditResponseDto.courseDuration;
          this.selectedCourseDetails.topics[index].assignment;
        }
        this.alert.success(res.message);
      }
      this.tableLoader.hideLoader();
    });
  }

  createNewAssignment() {
    if (this.createAssignmentForm.valid) {
      const durationInDay = Number(
        this.createAssignmentForm.value.courseduration
      );
      const marks = Number(this.createAssignmentForm.value.marks);
      const addTimeToCourseDuration =
        this.createAssignmentForm.value.addduration;
      const data = {
        durationInDay: durationInDay,
        marks: marks,
        addTimeToCourseDuration: addTimeToCourseDuration,
      };
      this.loader.showLoader(
        'Please wait while we are creating this Assignment. This may take a few minutes...'
      );

      this.userService.postData(`assignments/${this.topicId}`, data).subscribe(
        (res) => {
          this.alert.success('Assignment created succesfully');
          const topicIndex = this.selectedCourseDetails.topics.findIndex(
            (topic) => topic.id === res.topicId
          );

          if (topicIndex !== -1) {
            const newAssignment = {
              id: res.id,
              name: res.content.assignmentTitle,
              content: res.content,
              marks: res.marks,
            };
            this.selectedCourseDetails.topics[topicIndex].assignment.push(
              newAssignment
            );
            if (addTimeToCourseDuration) {
              this.selectedCourseDetails.duration += durationInDay;
              this.selectedCourseDetails.topics[topicIndex].duration +=
                durationInDay;
            }
          }

          this.alert.success('Assignment created successfully');
          this.createAssignmentForm.reset();
          this.createAssignmentForm.get('addduration')?.setValue(false);
          this.loader.hideLoader();
        },
        (error) => {
          const errorMessage = 'An error occured while creating assignment';
          this.alert.error(errorMessage);
          this.createAssignmentForm.reset();
          this.createAssignmentForm.get('addduration')?.setValue(false);
          this.loader.hideLoader();
        }
      );
    } else {
      this.alert.error('Please enter valid form values');
    }
  }

  getTopicId(topicId: string, duration: number, index: number) {
    this.deleteTopicId = topicId;
    this.deleteTopicDuration = duration;
    this.updateTopicIndex = index;
  }

  deleteTopic() {
    this.tableLoader.showLoader();
    this.userService
      .deleteData(
        `Topic/DeleteTopic?topicId=${this.deleteTopicId}&duration=${this.deleteTopicDuration}&index=${this.updateTopicIndex}`
      )
      .subscribe((res) => {
        if (res) {
          this.selectedCourseDetails.duration = res.courseDuration;
          this.alert.success(res.message);
          this.getCourseDetailList(this.selectedCourseDetails.id);
        }
        this.tableLoader.hideLoader();
      });
  }

  toggleRearrange() {
    this.rearrange = !this.rearrange;
    this.loader.showLoader();
    if (!this.rearrange) {
      const indexArray = this.selectedCourseDetails.topics.map((item) => {
        return { id: item.id, index: item.index };
      });

      this.userService
        .changeData('Topic/RearrangeTopic', indexArray)
        .subscribe((res) => {
          if (res) {
            this.alert.success('Topic list updated successfully.');
          } else {
            this.alert.error('Failed to load topic list.');
          }
          this.getCourseDetailList(this.selectedCourseDetails.id);
        });
    }
    this.loader.hideLoader();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.selectedCourseDetails.topics,
      event.previousIndex,
      event.currentIndex
    );
  }

  getQuizDetail(quiz: Quiz) {
    this.tableLoader.showLoader();
    this.EditQuizForm.patchValue({
      question: quiz.title,
      option1: quiz.option1,
      option2: quiz.option2,
      option3: quiz.option3,
      option4: quiz.option4,
      answer: quiz.answer,
      editMarks: quiz.marks,
    });
    this.storeQuizId = quiz.id;
    this.tableLoader.hideLoader();
  }

  editQuiz(data: any) {
    this.tableLoader.showLoader();
    data.quizId = this.storeQuizId;

    if (typeof data.editMarks !== 'string') {
      data.editMarks = String(data.editMarks);
    }
    this.userService.changeData(`Quiz/UpdateQuiz`, data).subscribe((res) => {
      if (res.quizEditDto) {
        // Iterate through topics to find the correct topic
        for (let i = 0; i < this.selectedCourseDetails.topics.length; i++) {
          const topic = this.selectedCourseDetails.topics[i];

          // Check if the current topic has the quiz with the specified quizId
          const quizIndex = topic.quiz.findIndex(
            (quiz) => quiz.id === res.quizEditDto.quizId
          );
          if (quizIndex !== -1) {
            this.selectedCourseDetails.topics[i].quiz[quizIndex].title =
              res.quizEditDto.question;
            this.selectedCourseDetails.topics[i].quiz[quizIndex].option1 =
              res.quizEditDto.option1;
            this.selectedCourseDetails.topics[i].quiz[quizIndex].option2 =
              res.quizEditDto.option2;
            this.selectedCourseDetails.topics[i].quiz[quizIndex].option3 =
              res.quizEditDto.option3;
            this.selectedCourseDetails.topics[i].quiz[quizIndex].option4 =
              res.quizEditDto.option4;
            this.selectedCourseDetails.topics[i].quiz[quizIndex].answer =
              res.quizEditDto.answer;
            this.selectedCourseDetails.topics[i].quiz[quizIndex].marks =
              res.quizEditDto.editMarks;
          }
          this.alert.success(res.message);
        }
      }
      this.tableLoader.hideLoader();
    });
  }

  getQuizId(quiz: Quiz) {
    this.deleteQuizId = quiz.id;
  }

  deleteQuiz() {
    this.tableLoader.showLoader();

    this.userService
      .deleteData(`Quiz/DeleteQuiz?quizId=${this.deleteQuizId}`)
      .subscribe((res) => {
        if (res) {
          // Find the topic containing the quiz to be deleted
          const topicWithQuiz = this.selectedCourseDetails.topics.find(
            (topic) => topic.quiz.some((quiz) => quiz.id === this.deleteQuizId)
          );

          if (topicWithQuiz) {
            // Find the index of the quiz within the topic
            const quizIndex = topicWithQuiz.quiz.findIndex(
              (quiz) => quiz.id === this.deleteQuizId
            );

            if (quizIndex !== -1) {
              // Remove the quiz from the topic
              topicWithQuiz.quiz.splice(quizIndex, 1);
            }
          }
          this.alert.success(res.message);
        }
        this.tableLoader.hideLoader();
      });
  }

  getTopicIdforAddQuiz(topicid: string) {
    this.topicIdForQuiz = topicid;
  }

  AddQuiz(data: any) {
    if (this.AddQuizForm.valid) {
      data.topicId = this.topicIdForQuiz;
      this.tableLoader.showLoader();
      this.userService.postData(`Quiz/AddQuiz`, data).subscribe(
        (res) => {
          if (res.message) {
            this.alert.success(res.message); // Show success message in an alert box
            this.AddQuizForm.reset(); // Reset the form values

            // Push the new quiz data into the quiz array
            const newQuiz = {
              id: res.quizAddResponseDto.quizId,
              title: res.quizAddResponseDto.question,
              option1: res.quizAddResponseDto.option1,
              option2: res.quizAddResponseDto.option2,
              option3: res.quizAddResponseDto.option3,
              option4: res.quizAddResponseDto.option4,
              answer: res.quizAddResponseDto.answer,
              marks: res.quizAddResponseDto.marks,
            };
            const topic = this.selectedCourseDetails.topics.find(
              (topics) => topics.id === res.quizAddResponseDto.topicId
            );
            topic!.quiz.push(newQuiz);
            this.tableLoader.hideLoader();
          }
        },
        (error: HttpErrorResponse) => {
          console.error(error); // Log the full error response

          // Check if the error response contains the 'error' property
          if (error.error && error.error.error) {
            const errorMessage = error.error.error;
            this.alert.error(error.error);
            this.alert.error(errorMessage); // Show error message in an alert box
            this.tableLoader.hideLoader();
          } else {
            // Show a generic error message in an alert box
            this.alert.error('An error occurred while creating the course.');
            this.tableLoader.hideLoader();
          }
        }
      );
    } else {
      this.alert.error('Please enter valid form values');
    }
  }

  getAssignmentDetail(assignment: Assignment) {
    this.percentageLimit = false;
    this.EditAssignmentForm.reset();
    this.editAssignmentMode = true;
    this.selectedAssignmentInstructions = null;
    this.selectedAssignmentPercentage = null;
    this.assignmentArrayPart = [];
    this.partDetails = [];
    this.tableLoader.showLoader();
    this.assignmentArrayPart = assignment.content.gradingCriteria.map(
      (item) => {
        if (typeof item.percentage === 'string') {
          const percentageWithoutSymbol = parseFloat(
            item.percentage.replace('%', '')
          );
          return { ...item, percentage: percentageWithoutSymbol };
        } else {
          return item;
        }
      }
    );
    this.EditAssignmentForm.patchValue({
      assignmentName: assignment.name,
      assignmentMarks: assignment.marks,
    });
    this.editPartAssignmentArray = [];

    for (let i = 0; i < assignment.content.gradingCriteria.length; i++) {
      const gradingItem = assignment.content.gradingCriteria[i];
      const instructionItem = assignment.content.instructions[i];
      let percentageString = gradingItem.percentage.toString();
      if (percentageString.includes('%')) {
        percentageString = percentageString.replace('%', '');
      }

      const partDetail: PartDetails = {
        PartNo: gradingItem.part.toString(),
        PartPercentage: percentageString,
        PartNote: instructionItem ? instructionItem.note : '',
      };

      this.editPartAssignmentArray.push({ partDetails: [partDetail] });
    }

    this.storeAssignmentId = assignment.id;
    this.storeAssignmentPoints = assignment.content.instructions;
    this.storeAssignmentGrade = assignment.content.gradingCriteria;

    this.tableLoader.hideLoader();
  }

  updateAssignmentPoint(event: Event, data: any) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      const selectedValue = parseInt(target.value, 10);
      const selectedInstruction = this.storeAssignmentPoints.find(
        (instruction) => instruction.part === selectedValue
      );
      const selectedPercentage = this.storeAssignmentGrade.find(
        (grade) => grade.part === selectedValue
      );
      const selectedPart = target.value;
      this.selectedAssignmentPart = selectedPart;
      const partDetail = this.partDetails.find(
        (part) => part.part === this.selectedAssignmentPart
      );

      this.selectedAssignmentInstructions = partDetail
        ? partDetail.note
        : selectedInstruction
          ? selectedInstruction.note
          : '';
      this.selectedAssignmentPercentage = partDetail
        ? partDetail.percentage
        : selectedPercentage
          ? selectedPercentage.percentage
          : '';
      // Patch the values to the form controls
      this.EditAssignmentForm.patchValue({
        assignmentPoint: selectedValue,
        assignmentNote: this.selectedAssignmentInstructions,
        percentage: this.selectedAssignmentPercentage,
        editPartForm: selectedValue,
      });
    }
  }
  editAssignment(data: any) {
    this.tableLoader.showLoader();
    this.percentageLimit = false;

    data.assignmentId = this.storeAssignmentId;
    if (
      this.selectedAssignmentInstructions &&
      this.selectedAssignmentPercentage
    ) {
      this.userService
        .changeData(`assignments/UpdateAssignment`, data)
        .subscribe(
          (res) => {
            if (res) {
              // Iterate through topics to find the correct topic
              for (
                let i = 0;
                i < this.selectedCourseDetails.topics.length;
                i++
              ) {
                const topic = this.selectedCourseDetails.topics[i];

                // Check if the current topic has the assignment with the specified assignmentId
                const assignmentIndex = topic.assignment.findIndex(
                  (assignment) =>
                    assignment.id === res.assignmentEditDto.assignmentId
                );
                if (assignmentIndex !== -1) {
                  this.selectedCourseDetails.topics[i].assignment[
                    assignmentIndex
                  ].name = res.assignmentEditDto.assignmentName;
                  this.selectedCourseDetails.topics[i].assignment[
                    assignmentIndex
                  ].marks = res.assignmentEditDto.assignmentMarks;
                  this.selectedCourseDetails.topics[i].assignment[
                    assignmentIndex
                  ].content = res.assignmentEditDto.content;
                }
                this.EditAssignmentForm.reset();
                this.selectedAssignmentPercentage = null;
                this.selectedAssignmentInstructions = null;
                this.selectedAssignmentPart = null;
                this.assignmentArrayPart = [];
                this.alert.success(res.message);
              }
            }
            this.tableLoader.hideLoader();
          },
          (error: HttpErrorResponse) => {
            console.error(error); // Log the full error response

            // Check if the error response contains the 'error' property
            if (error.error || error.error.error) {
              const errorMessage = 'An error occured while updating assignment';
              this.alert.error(error.error);
              this.alert.error(errorMessage); // Show error message in an alert box
              this.tableLoader.hideLoader();
            }
          }
        );
    } else {
      this.alert.error('Please select part in asssignment');
      this.tableLoader.hideLoader();
    }
  }
  deleteAssignmentPart(assignmentId: string, assignmentPart: number) {
    this.userService.getData(`assignments/${assignmentId}`).subscribe((res) => {
      if (res) {
        this.remainingpartCount = res.content.instructions.length;
      }
    });

    if (this.remainingpartCount <= 2) {
      this.warningPart = true;
      this.alert.error('You can not remove all parts');
    } else {
      this.tableLoader.showLoader();
      this.userService
        .deleteData(
          `assignments/DeleteAssignmentPart?assignmentId=${assignmentId}&assignmentPart=${assignmentPart}`
        )
        .subscribe(
          (res) => {
            if (res) {
              const topicWithAssignmentIndex =
                this.selectedCourseDetails.topics.findIndex((topic) =>
                  topic.assignment.some(
                    (assignment) => assignment.id === assignmentId
                  )
                );
              const topicWithAssignment =
                this.selectedCourseDetails.topics.find((topic) =>
                  topic.assignment.some(
                    (assignment) => assignment.id === assignmentId
                  )
                );

              if (topicWithAssignment && topicWithAssignmentIndex !== -1) {
                // Find the index of the assignment within the topic
                const AssignmentIndex =
                  topicWithAssignment.assignment.findIndex(
                    (assignment) => assignment.id === assignmentId
                  );

                if (AssignmentIndex !== -1) {
                  this.selectedCourseDetails.topics[
                    topicWithAssignmentIndex
                  ].assignment[AssignmentIndex].content =
                    res.assignmentPartDelete.content;
                }
              }
              this.EditAssignmentForm.reset();
              this.selectedAssignmentPercentage = null;
              this.selectedAssignmentInstructions = null;
              this.selectedAssignmentPart = null;
              this.alert.success(res.message);
            }
            this.tableLoader.hideLoader();
          },
          (error: HttpErrorResponse) => {
            console.error(error); // Log the full error response

            // Check if the error response contains the 'error' property
            if (error.error || error.error.error) {
              const errorMessage =
                'An error occured while deleting assignment part';
              this.EditAssignmentForm.reset();
              this.selectedAssignmentPercentage = null;
              this.selectedAssignmentInstructions = null;
              this.selectedAssignmentPart = null;
              this.alert.error(error.error);
              this.alert.error(errorMessage); // Show error message in an alert box
              this.tableLoader.hideLoader();
            }
          }
        );
    }
  }

  resetEditAssignment() {
    this.selectedAssignmentPercentage = null;
    this.selectedAssignmentInstructions = null;
    this.selectedAssignmentPart = null;
    this.totalPercentage = 0;
    this.percentageLimit = false;
  }

  getAssignmentId(assignmentId: string) {
    this.deleteAssignmentId = assignmentId;
  }
  toggleMode() {
    this.editAssignmentMode = false;
  }
  deleteAssignment(duration: boolean) {
    this.tableLoader.showLoader();
    this.userService
      .deleteData(
        `assignments/DeleteAssignment?assignmentId=${this.deleteAssignmentId}&checkDuration=${duration}`
      )
      .subscribe(
        (res) => {
          if (res.deleteAssignmentDto) {
            // Find the topic containing the assignment to be deleted
            const topicWithAssignmnent = this.selectedCourseDetails.topics.find(
              (topic) =>
                topic.assignment.some(
                  (assignment) => assignment.id === this.deleteAssignmentId
                )
            );

            //update the duration in topic and course
            this.selectedCourseDetails.duration =
              res.deleteAssignmentDto.courseDuration;
            const topicIndex = this.selectedCourseDetails.topics.findIndex(
              (topic) => topic.id === res.deleteAssignmentDto.topicId
            );
            this.selectedCourseDetails.topics[topicIndex].duration =
              res.deleteAssignmentDto.topicDuration;

            if (topicWithAssignmnent) {
              // Find the index of the assignment within the topic
              const assignmentIndex = topicWithAssignmnent.assignment.findIndex(
                (assignment) => assignment.id === this.deleteAssignmentId
              );

              if (assignmentIndex !== -1) {
                // Remove the assignment from the topic
                topicWithAssignmnent.assignment.splice(assignmentIndex, 1);
              }
            }
            // Reset addduration variable after processing the deletion
            this.addduration = false;

            this.alert.success(res.message);
            this.tableLoader.hideLoader();
          } else if (res) {
            // Find the topic containing the assignment to be deleted
            const topicWithAssignmnent = this.selectedCourseDetails.topics.find(
              (topic) =>
                topic.assignment.some(
                  (assignment) => assignment.id === this.deleteAssignmentId
                )
            );
            if (topicWithAssignmnent) {
              // Find the index of the assignment within the topic
              const assignmentIndex = topicWithAssignmnent.assignment.findIndex(
                (assignment) => assignment.id === this.deleteAssignmentId
              );

              if (assignmentIndex !== -1) {
                // Remove the assignment from the topic
                topicWithAssignmnent.assignment.splice(assignmentIndex, 1);
              }
            }
            // Reset addduration variable after processing the deletion
            this.addduration = false;

            this.alert.success(res.message);
            this.tableLoader.hideLoader();
          }
        },
        (error: HttpErrorResponse) => {
          console.error(error); // Log the full error response

          // Check if the error response contains the 'error' property
          if (error.error || error.error.error) {
            const errorMessage = 'An error occured while deleting assignment';
            this.alert.error(error.error);
            this.alert.error(errorMessage); // Show error message in an alert box

            // Reset addduration variable after error in deletion
            this.addduration = false;

            this.tableLoader.hideLoader();
          }
        }
      );
  }
  getTopicIdforAddAssignment(topicId: string) {
    this.topicIdForAssignment = topicId;
  }
  savePart(data: any) {
    this.AddPartForm.reset();
    if (this.editAssignmentMode) {
      this.storeAssignmentPoints.push({
        part: data.partNo,
        note: data.partNote,
      });
      this.storeAssignmentGrade.push({
        part: data.partNo,
        percentage: data.partPercentage,
      });
      this.partDetails.push({
        part: data.partNo.toString(),
        note: data.partNote,
        percentage: data.partPercentage + '%',
      });
      this.assignmentArrayPart.push({
        part: data.partNo,
        percentage: data.partPercentage,
      });
    } else {
      const newInstruction = {
        part: data.partNo,
        note: data.partNote,
      };
      const newGradingCriteria = {
        part: data.partNo,
        percentage: data.partPercentage + '%',
      };
      this.assignmentArrayPart.push(data);
      this.assignmentPartsArray.push(newInstruction);
      this.assignmentGradingArray.push(newGradingCriteria);
      this.totalPercentage = this.totalPercentage + data.partPercentage;
      if (this.totalPercentage > 100) {
        this.percentageLimit = true;
      }

      this.AddPartForm.reset();
    }
  }
  addUserAssignment(data: any) {
    this.loader.showLoader();
    data.assignmentId = this.storeTopicId;

    const value = {
      durationInDay: data.assignmentDuration,
      marks: data.assignmentMarks,
      topicId: this.storeTopicId,
      content: {
        assignmentTitle: this.storeTopicName,
        course: this.selectedCourseDetails.name,
        topic: this.storeTopicName,
        objective: data.objective,
        instructions: this.assignmentPartsArray,
        gradingCriteria: this.assignmentGradingArray,
      },

      name: data.assignmentName,
      addTimeToCourseDuration: data.adddurations,
    };
    this.userService
      .postData(`assignments/create/user?topicsId=${this.storeTopicId}`, value)
      .subscribe((res) => {
        this.loader.hideLoader();
        this.alert.success('Assignment created succesfully');
        const topicIndex = this.selectedCourseDetails.topics.findIndex(
          (topic) => topic.id === res.topicId
        );
        if (topicIndex !== -1) {

          const newAssignment = {
            id: res.id,
            name: data.assignmentName,
            content: res.content,
            marks: res.marks,
          };
          this.selectedCourseDetails.topics[topicIndex].assignment.push(
            newAssignment
          );
          if (data.adddurations) {
            this.selectedCourseDetails.duration += data.assignmentDuration;
            this.selectedCourseDetails.topics[topicIndex].duration +=
              data.assignmentDuration;
          }
        }

        this.AddPartForm.reset();
        this.AddAssignmentForm.reset();
        this.AddAssignmentForm.get('adddurations')?.setValue(false);
        this.assignmentArrayPart = [];
        this.assignmentPartsArray = [];
        this.assignmentGradingArray = [];
      });
  }
  closeAssignmentForm() {
    this.AddPartForm.reset();
    this.AddAssignmentForm.reset();
    this.AddAssignmentForm.get('adddurations')?.setValue(false);
    this.assignmentArrayPart = [];
    this.assignmentPartsArray = [];
    this.assignmentGradingArray = [];
    this.percentageLimit = false;
    this.percentageLimit = false;
  }
  closeAddPart() {
    this.AddPartForm.reset();
  }
  deletePart(index: number) {
    if (index >= 0 && index < this.assignmentArrayPart.length) {
      this.assignmentArrayPart.splice(index, 1);
      this.assignmentPartsArray.splice(index, 1);
      this.assignmentGradingArray.splice(index, 1);
    }
  }
  uniquePartNumberValidator() {
    return (control: FormControl) => {
      const partNo = control.value;
      if (partNo !== null && partNo !== '') {
        const isPartNumberUnique = this.assignmentArrayPart.every(
          (part) => part.isDeleted || part.partNo !== partNo
        );

        return isPartNumberUnique ? null : { notUnique: true };
      }
      return null;
    };
  }
  partPercentageValidator(maxTotal: number) {
    return (control: FormGroup) => {
      const partPercentage = control.get('partPercentage')?.value;
      const totalPercentage = this.calculateTotalPercentage();
      if (totalPercentage + partPercentage > maxTotal) {
        control
          .get('partPercentage')
          ?.setErrors({ totalPercentageExceeded: true });
      } else {
        control.get('partPercentage')?.setErrors(null);
      }
      if (this.editAssignmentMode && totalPercentage !== 100) {
        this.percentageLimit = true;
      }
      return null;
    };
  }
  calculateTotalPercentage() {
    let totalPercentage = 0;
    for (const part of this.assignmentArrayPart) {
      if (!part.isDeleted) {
        totalPercentage +=
          part.partPercentage !== undefined
            ? part.partPercentage
            : part.percentage;
      }
    }

    return totalPercentage;
  }
  validatePercentage(partIndex: number, newPercentage: string) {
    const numericPercentage = parseFloat(newPercentage.replace('%', ''));
    this.assignmentArrayPart[partIndex - 1].percentage = numericPercentage;
    const totalPercentage = this.calculateTotalPercentage();
    if (totalPercentage != 100) {
      this.percentageLimit = true;
      this.EditAssignmentForm.get('percentage')?.setErrors({
        totalPercentageExceeded: true,
      });
    } else {
      this.percentageLimit = false;
      this.EditAssignmentForm.get('percentage')?.setErrors(null);
    }
  }

  closecreateAssignmentForm() {
    this.createAssignmentForm.reset();
  }
  getQuizLink(topicId: string, quizLink: any) {
    this.showQuizLinkConfirmationModel = false;
    if (quizLink === '') {
      this.loader.showLoader();

      const data = {
        TopicId: topicId,
      };
      this.userService.postData(`Quiz/GetQuizLink`, data).subscribe(
        (res) => {
          this.loader.hideLoader();
          const topicIndex = this.selectedCourseDetails.topics.findIndex(
            (topic) => topic.id === topicId
          );
          this.selectedCourseDetails.topics[topicIndex].quizLink = res.testLink;
          this.alert.success('Link created succesfully');
          this.showQuizLinkConfirmationModel = false;
        },
        (error) => {
          this.loader.hideLoader();
          this.alert.error('Error occured while creating link');
        }
      );
    } else {
      this.loader.hideLoader();
      this.showQuizLinkConfirmationModel = true;
      this.updateTopicId = topicId;
    }
  }

  Update() {
    const data = {
      TopicId: this.updateTopicId,
    };
    this.showQuizLinkConfirmationModel = false;
    this.loader.showLoader();
    this.userService.postData(`Quiz/GetQuizLink`, data).subscribe(
      (res) => {
        const topicIndex = this.selectedCourseDetails.topics.findIndex(
          (topic) => topic.id === this.updateTopicId
        );
        this.selectedCourseDetails.topics[topicIndex].quizLink = res.testLink;
        this.loader.hideLoader();
        this.alert.success('Link updated succesfully');
      },
      (error) => {
        this.loader.hideLoader();
        this.alert.error('Error occured while creating link');
      }
    );
  }

  close() {
    this.showQuizLinkConfirmationModel = false;
  }
  calculateTotalPercentageOfTopic(topicId: string): number {
    const topic = this.selectedCourseDetails.topics.find(
      (topic) => topic.id === topicId
    );
    if (topic && topic.assignment) {
      let totalPercentage = 0;
      for (const assignment of topic.assignment) {
        if (assignment.content && assignment.content.gradingCriteria) {
          for (const criteria of assignment.content.gradingCriteria) {
            if (criteria && criteria.percentage) {
              totalPercentage += parseFloat(criteria.percentage);
            }
          }
        }
      }
      return totalPercentage;
    }

    return 0;
  }
  editAssignmentNew(data: any) {
    this.tableLoader.showLoader();
    this.percentageLimit = false;

    data.assignmentId = this.storeAssignmentId;
    const body = {
      assignmentId: this.storeAssignmentId,
      assignmentName: data.assignmentName,
      assignmentMarks:
        typeof data.assignmentMarks === 'string'
          ? data.assignmentMarks
          : String(data.assignmentMarks),
      PartsDetails: this.partDetails,
    };

    if (
      this.selectedAssignmentInstructions &&
      this.selectedAssignmentPercentage
    ) {
      this.userService
        .changeData(`assignments/UpdateAssignment`, body)
        .subscribe(
          (res) => {
            if (res) {
              // Iterate through topics to find the correct topic
              for (
                let i = 0;
                i < this.selectedCourseDetails.topics.length;
                i++
              ) {
                const topic = this.selectedCourseDetails.topics[i];

                // Check if the current topic has the assignment with the specified assignmentId
                const assignmentIndex = topic.assignment.findIndex(
                  (assignment) =>
                    assignment.id === res.assignmentEditDto.assignmentId
                );
                if (assignmentIndex !== -1) {
                  this.selectedCourseDetails.topics[i].assignment[
                    assignmentIndex
                  ].name = res.assignmentEditDto.assignmentName;
                  this.selectedCourseDetails.topics[i].assignment[
                    assignmentIndex
                  ].marks = res.assignmentEditDto.assignmentMarks;
                  this.selectedCourseDetails.topics[i].assignment[
                    assignmentIndex
                  ].content = res.assignmentEditDto.content;
                }
                this.EditAssignmentForm.reset();
                this.selectedAssignmentPercentage = null;
                this.selectedAssignmentInstructions = null;
                this.selectedAssignmentPart = null;
                this.assignmentArrayPart = [];
                this.alert.success(res.message);
              }
            }
            this.tableLoader.hideLoader();
          },
          (error: HttpErrorResponse) => {
            this.tableLoader.hideLoader();
            console.error(error); // Log the full error response

            // Check if the error response contains the 'error' property
            if (error.error || error.error.error) {
              const errorMessage = 'An error occured while updating assignment';
              this.alert.error(error.error);
              this.alert.error(errorMessage); // Show error message in an alert box
              this.tableLoader.hideLoader();
            }
          }
        );
    } else {
      this.alert.error('Please select part in asssignment');
      this.tableLoader.hideLoader();
    }
  }

  updatePartDetails(part: number, note: string, percentage: any) {
    this.selectedAssignmentPercentage = percentage;
    this.selectedAssignmentInstructions = note;
    const existingPartIndex = this.partDetails.findIndex(
      (item: { part: number }) => item.part === part
    );
    const existingPartIndexAssignmentPartArray =
      this.assignmentArrayPart.findIndex(
        (item: { part: number }) => item.part === part
      );
    if (existingPartIndexAssignmentPartArray !== -1) {
      this.assignmentArrayPart[existingPartIndexAssignmentPartArray] = {
        part: part,
        note: note,
        percentage: percentage,
      };
      this.assignmentArrayPart[part - 1].percentage = percentage;
    }
    if (existingPartIndex !== -1) {
      this.partDetails[existingPartIndex] = {
        part: part,
        note: note,
        percentage: percentage,
      };
      this.assignmentArrayPart[part - 1].percentage = percentage;
    } else {
      this.partDetails.push({
        part: part,
        note: note,
        percentage: percentage,
      });
      const numericPercentage = parseFloat(percentage.replace('%', ''));
      this.assignmentArrayPart[part - 1].percentage = numericPercentage;
    }
    this.validatePercentage(part, percentage);
  }

  getNextAvailablePartNo(): number {
    let maxPartNo = 0;
    this.assignmentArrayPart.forEach((item) => {
      if (item.part > maxPartNo) {
        maxPartNo = item.part;
      }
    });
    return maxPartNo + 1;
  }
  checkMin(input: any) {
    const min = this.getNextAvailablePartNo();
    const enteredValue = Number(input);
    if (enteredValue < min) {
      this.show = true;
    } else {
      this.show = false;
    }
  }
  handleBack() {
    this.router.navigate(['/dashboard/courses'], {
      queryParams: { page: localStorage.getItem('coursePageNo') },
    });
  }


  /**
   * Retrieves a specific form control from the AddQuizForm based on the provided control name.
   * This method is useful for accessing individual form controls in the form group,
   * allowing for validation, manipulation, or extraction of values.
   *
   * @param {string} controlName - The name of the form control to retrieve.
   * @returns {AbstractControl | null} - The requested form control if found, or null if it does not exist.
   */
  getQuizControl(controlName: string) {
    return this.AddQuizForm.get(controlName);
  }

  /**
   * method to close quiz model and reset form
   * @returns void
   */
  closeQuiz(): void {
    this.AddQuizForm.reset();
  }

}
