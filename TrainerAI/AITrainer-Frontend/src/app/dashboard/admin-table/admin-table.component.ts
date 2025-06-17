import { Component} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/Services/user.service';
import { CareerPathDTO, ProjectManagerDTO, TechStackDTO, userList } from 'src/app/model/intern';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { CareerPath } from 'src/app/model/career-path';
import { StringConstant } from 'src/app/model/string-constants';
@Component({
  selector: 'app-admin-table',
  templateUrl: './admin-table.component.html',
  styleUrls: ['./admin-table.component.css'],
})

export class AdminTableComponent {
  addAdminForm!: FormGroup;
  selectedRoleType: string = '';
  editMode: boolean;
  selectedAdminToDelete!: string;
  users: userList[] = [];
  id: string = '';
  emailDeleted: boolean = false;
  Addbody: any;
  currentPage: number = 1;
  pageNumbers: number[] = [];
  visiblePages: number = 3;
  totalPage: number = 0;
  defualtList: number = 10;
  isAllDeleted: boolean = false;
  org: any;
  types: string[] = ['Technical Administrator', 'Mentor'];
  techStacks: TechStackDTO[] = [];  
  selectedTechStacks: string[] = []; 
  newTechStack: string = ''; 
  careerPaths: CareerPath[] = []; 
  projectManagers: ProjectManagerDTO[] = [];
  selectedProjectManagers: string[] = []; 
  projectManagersEmails: string[] = [];
  selectedOrganization: string ='';
  readonly AreYousureText  = StringConstant.areYousureText;
  readonly Close = StringConstant.close;
  readonly Delete = StringConstant.delete;
  readonly DeleteAdmin = StringConstant.deleteAdmin;
  readonly Enable = StringConstant.enable;
  readonly AreYouSureYouWantToEnableAdmin = StringConstant.areYouSureYouWantToEnableAdmin;
  readonly Updates = StringConstant.update;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private loader: LoaderTableService,
    private alert: AlertToasterService,
  ) {
    this.editMode = true;
    this.techStacks = [];  
    this.careerPaths = []; 
  }
  ngOnInit(): void {
    this.initInternForm();
    this.getAdminList();
    this.getOrganizationList();
    this.getTechStackList();
    this.getCareerPathList(); 
    this.getProjectManagers();
  }

  initInternForm() {
    this.addAdminForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
          ),
        ],
      ],
      organization: ['', [Validators.required]],
      careerPathField: [''],
      type:['', [Validators.required]],
      phone :['', [Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]], 
    });
  }

  getAdminList() {
    this.loader.showLoader();
    const techStackParams = this.selectedTechStacks.join(',');
    const queryParams = {
      currentPage: this.currentPage,
      defualtList: this.defualtList,
      roleType: this.selectedRoleType,
      organizationId: this.selectedOrganization,
      techStacks: techStackParams
    };
  
    this.userService.getData('SuperAdmin/list-admin', queryParams)
      .subscribe(
        (res) => {
          this.totalPage = res.totalPages;
          this.updateVisiblePages();
          this.users = res.adminProfiles;
          this.loader.hideLoader();
        },
        (error) => {
          this.loader.hideLoader();
          this.alert.error('Unable to fetch details. Please try again later...');
        });
  }
  addAdmin(data: any) {
    this.loader.showLoader();
    const techStacksNames = this.selectedTechStacks.map(techName => ({ name:techName }));
    const projectManagers = this.selectedProjectManagers;
    this.Addbody = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      organization: data.organization,
      contactNo:data.phone,
      type:data.type,
      techStacks: techStacksNames,
      careerPathId: data.careerPathField,
      projectManagerIds: projectManagers
    };
    this.userService
      .getData(`SuperAdmin/IsDeletd?email=${data.email}`)
      .subscribe((res) => {
        if (res == true) {
          this.emailDeleted = true;
          this.loader.hideLoader();

        } else {
          this.userService
            .postData('SuperAdmin/create-admin', this.Addbody)
            .subscribe((res) => {
              if (res) {
                this.users.push(res);
                this.goToPage(this.currentPage);
                this.updateVisiblePages();
                this.addAdminForm.reset();
                this.loader.hideLoader();
                this.alert.success("Admin Created Successfully");
                this.getTechStackList();
                this.selectedTechStacks = [];
                this.getAdminList();
              }
            },
            (error)=>{
              this.loader.hideLoader();
              this.alert.error(error.error.message);
            });
        }
      });
  }

  setEditMode(value: boolean, id: any) {
    this.editMode = value;
    this.id = id;
    if (value) {
      this.addAdminForm.get('email')?.disable();
      this.addAdminForm.get('organization')?.disable();
      this.userService.getData(`SuperAdmin/detials?Id=${id}`).subscribe((res) => {
        this.addAdminForm.patchValue({
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email,
          organization: res.organization,
          phone:res.contactNo,
          type:res.type,
          careerPathField: res.careerPath?.name

        });
        this.selectedTechStacks = res.techStacks;
        this.selectedProjectManagers = res.projectManagersEmails;

      });
    }
    else {
      this.addAdminForm.reset();
      this.addAdminForm.get('email')?.enable();
      this.addAdminForm.get('organization')?.enable();
    }
  }

  editDetails(data: any) {
    this.loader.showLoader();
    const techStacksNames = this.selectedTechStacks.map(techName => ({ name: techName }));
    const projectManagers = this.selectedProjectManagers; 
    const careerPath = this.careerPaths.find(cp => cp.name === data.careerPathField)
    const adminCareerPath = {
      Id: careerPath?.id,
      Name: careerPath?.name
    } 

    const body = {
        id: this.id,
        firstName: data.firstName,
        lastName: data.lastName,
        contactNo: data.phone, 
        type: data.type,
        techStacks: techStacksNames,
        careerPath: adminCareerPath,
        projectManagerIds: projectManagers
    };

    // Call the update API
    this.userService.changeData('SuperAdmin/updateDetails', body)
        .subscribe((res) => {
            if (res) {
                const index = this.users.findIndex((user) => user.id === res.id);
                if (index !== -1) {
                    this.users[index] = res; 
                }
                this.loader.hideLoader();
                this.alert.success("Admin details Changed successfully");
                this.getTechStackList();
                this.selectedTechStacks = [];
                this.getAdminList();
            }
        }, (error) => {
            this.loader.hideLoader();
            this.alert.error(error.error.message);
        });

    this.editMode = true; 
}


  selectToDelete(index: number) {
    this.selectedAdminToDelete = this.users[index].id;
  }

  deleteAdmin(id: any) {
    this.loader.showLoader();
    this.userService
      .deleteData(`SuperAdmin/delete?Id=${id}`)
      .subscribe((res) => {
        if (res) {
          const indexToRemove = this.users.findIndex((user) => user.id === id);
          if (indexToRemove !== -1) {
            this.users.splice(indexToRemove, 1);
          }
          if (this.users.length === 0) {
            if (this.currentPage > 1) {
              this.currentPage--;
              this.goToPage(this.currentPage);
              this.updateVisiblePages();
            }
          } else {
            this.goToPage(this.currentPage);
          }
          if (this.currentPage == 1) {
            if (
              this.users.length <= 0 &&
              this.users.every((user) => user.isDeleted)
            ) {
              this.isAllDeleted == true;
            }
          }
        this.loader.hideLoader();
        this.alert.success("Admin Delete Successfully")
        }
      });
  }

  close() {
    this.emailDeleted = false;
  }

  Update() {
    this.loader.showLoader();
    this.userService
      .changeData('SuperAdmin/enableAdmin', this.Addbody)
      .subscribe((res) => {
        this.users.push(res);
        this.emailDeleted = false;
        this.getAdminList();
      this.loader.hideLoader();
      });
  }

  updateVisiblePages() {
    const halfVisible = Math.floor(this.visiblePages / 2);
    const startPage = Math.max(1, this.currentPage - halfVisible);
    const endPage = Math.min(this.totalPage, startPage + this.visiblePages - 1);

    this.pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }
  }

  goToPage(pageNumber: any) {
    this.users = [];
    this.currentPage = pageNumber;
    this.userService
      .getData(
        `SuperAdmin/list-admin?currentPage=${pageNumber}&defualtList=${this.defualtList}`
      )
      .subscribe((res) => {
        this.users = [];
        this.users = res.adminProfiles;
        this.totalPage = res.totalPages;
        this.updateVisiblePages();
      });
  }

  next() {
    
    if (this.currentPage + 1 < this.totalPage) {
      this.currentPage++;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    } else if (this.totalPage != this.currentPage) {
      this.currentPage++;
      this.goToPage(this.currentPage);
      }
  }

  previous() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    }
  }


  getOrganizationList() {
    this.userService.getData(`Organization/List-Organizations`).subscribe((res) => {
    this.org = res;

    });
  }
  /**
   * Method to fetch a list of techstacks form the backend
   */
  getTechStackList() {
    this.userService.getData(`TechStack/List-TechStacks`).subscribe({
      next: (res) => {
        this.techStacks = res.sort((a: { name: string; }, b: { name: string; }) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Error fetching tech stacks:', err);
      }
    });
  }
  /**
   * Method to fetch a list of career paths from the backend
   */
  getCareerPathList() {
    this.userService.getData(`CareerPath/ListCareerPaths`).subscribe({
      next: (res) => {
        this.careerPaths = res.sort((a: { name: string; }, b: { name: string; }) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Error fetching career Paths:', err);
      }
    });
  }
  /**Method to fetch a list of project managers or admins from the backend
   * 
   */
  getProjectManagers() {
    this.userService.getData(`Organization/List-Admins`).subscribe({
      next: (res) => {
        this.projectManagers = res.sort((a: { email: string; }, b: { email: string; }) => a.email.localeCompare(b.email, undefined, { sensitivity: 'base' }));  
      },
      error: (err) => {
        console.error('Error fetching project managers:', err);
      }
    });
  }
  getControl(name: any): AbstractControl | null {
    return this.addAdminForm.get(name);
  }
  /**
   * Adds a new technology stack to the list of tech stacks if it's not already present.
   */
  addTechStack(): void {
    if (this.newTechStack.trim().length) {
      if (!this.techStacks.some(ts => ts.name.toLowerCase() === this.newTechStack.trim().toLowerCase())) {
        const newTech = { name: this.newTechStack.trim() };
        this.techStacks.push(newTech);
        this.selectedTechStacks.push(this.newTechStack.trim()); 
        this.newTechStack = ''; 
      }
      event?.stopPropagation();
    }
  }
  /**
   * Handles the "Enter" keypress event to add a new tech stack
   * @param event The KeyboardEvent from the user's input
   */
  handleKeypress(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      this.addTechStack();
      event.preventDefault();
    }
  }
  /**
   * Updates the newTechStack property based on user input and stops event propagation
   * @param event The input event from the tech stack input field
   */
  onTechStackInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newTechStack = input.value;
    event.stopPropagation(); 
  }

  /**
   * Handles changes in the selection of techstacks
   * @param event The DOM event triggered upon changing the selection, used to determine the checkbox's checked state.
   * @param tech The technstackDTO object associated with the changed selection, used to access specific properties like 'name'.
   */
  handleTechStackChange(event: Event, tech: TechStackDTO) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedTechStacks.push(tech.name);
    } else {
      this.selectedTechStacks = this.selectedTechStacks.filter(
        (item) => item !== tech.name
      );
    }
  }

  /**
   * Handles changes in the selection of project managers
   * @param event The DOM event triggered upon changing the selection, used to determine the checkbox's checked state.
   * @param manager The projectManagerDTo object associated with the changed selection, used to access specific properties like 'email'.
   */
  handleProjectManagerChange(event: Event, manager: ProjectManagerDTO) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedProjectManagers.push(manager.email);
    } else {
      this.selectedProjectManagers = this.selectedProjectManagers.filter(
        (item) => item !== (manager.email)
      );
    }
  }
  /**
 * Updates the selected organization ID and retrieves the admin list based on the selected organization.
 * @param orgId - The ID of the selected organization.
 */
  selectOrganizationFilter(orgId: string) {
    this.selectedOrganization = orgId;
    this.getAdminList();
  }

/**
  Handles changes in the selection of techstacks for filters
   * @param event The DOM event triggered upon changing the selection, used to determine the checkbox's checked state.
   * @param tech The technstackDTO object associated with the changed selection, used to access specific properties like 'name'.
 */
handleTechStackChanges(event: Event, techStack: string) {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
      this.selectedTechStacks.push(techStack)
  } else {
          this.selectedTechStacks = this.selectedTechStacks.filter(
            (item) => item !== techStack
          );
  }
  this.getAdminList();
}
/**
 * Retrieves the admin list based on the selected role type.
 * Triggered when the role type is changed.
 * Calls the getAdminList method to update the admin list.
 * @param selectedRoleType - The selected role type.
 */
onRoleChange(selectedRoleType: string): void {
  this.currentPage = 1;
  this.getAdminList();
}

  
}
