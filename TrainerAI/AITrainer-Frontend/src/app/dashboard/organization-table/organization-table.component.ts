import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder,FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/Services/user.service';
import { LoaderService } from 'src/app/loader/loader.service';
import { organization } from 'src/app/model/intern';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';

@Component({
  selector: 'app-organization-table',
  templateUrl: './organization-table.component.html',
  styleUrls: ['./organization-table.component.css']
})
export class OrganizationTableComponent implements OnInit{
  org: any;
  addOrganizationForm!: FormGroup;
  editMode!: boolean;
  id: any;
  Addbody: any;
  isAllDeleted: boolean = false;
  selectedOrgToDelete!: string;
  currentPage: number = 1;
  pageNumbers: number[] = [];
  visiblePages: number = 3;
  totalPage: number = 0;
  defualtList: number = 10;
  nameDeleted!: boolean;
  isNameExists: boolean = false;
  allOrg: any;
  constructor(private loader: LoaderService,private userService:UserService,private formBuilder: FormBuilder,private alert:AlertToasterService){}

  ngOnInit(): void 
  {
    this.getOrganizationList();
    this.initAddOrgForm();
    this.getallOrganaization();
  }
  getControl(name: any): AbstractControl | null {
    return this.addOrganizationForm.get(name);
  }
  getallOrganaization(){
    this.userService.getData(`Organization/List-Organizations`).subscribe((res)=>{
      this.allOrg=res;
   
      
    }
    );
  }
initAddOrgForm()
{
  this.addOrganizationForm=this.formBuilder.group({
    name :['',Validators.required],
    phone :['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]]
  });
}
  getOrganizationList() {
    this.loader.showLoader();
    this.userService.getData(`Organization/Organizations?currentPage=${this.currentPage}&defualtList=${this.defualtList}`).subscribe((res)=>{
      this.totalPage = res.totalPages;
      this.pageNumbers=res.totalPages;
      this.updateVisiblePages();
      this.org =res.organizationDetails;
    
      
     
     if(this.org){
      this.isAllDeleted=this.org.every((orgs:organization)=>orgs.isDeleted);
     }
      
      this.loader.hideLoader();
    });
  }
addOrganization(data:any)
{
  this.isNameExists = false;
  this.Addbody = {
    organizationName: data.name,
    organizationContactNo: data.phone
    
  }
  this.userService.getData(`Organization/IsDeletd?name=${data.name}`).subscribe((res) => {
       if (res == true) {
      this.nameDeleted = true;
     
    } else {
      this.userService.postData("Organization/addOrganization", this.Addbody).subscribe((res) => {
        if (res) {
          this.alert.success("Organization created Successfully");
          this.org.push(res);
          this.getOrganizationList();
          this.getallOrganaization();
          this.goToPage(this.currentPage);
          this.updateVisiblePages();
           this.loader.hideLoader();
        }
      },
      (error)=>{

        this.alert.error("Organization already exist");
      });
    }
  },
 
  )
  
}
setEditMode(value: boolean, name: any, id: any)
 {
  
  this.editMode = value;
  this.id = id;
  if (value) {
    this.userService.getData(`Organization/Organizations/id?organizationId=${id}`).subscribe((res)=>
    {
      this.addOrganizationForm.patchValue({
        name:res.organizationName,
        phone: res.organizationContactNo
      });
      this.loader.hideLoader();
    });
   
  }
  else {
    this.addOrganizationForm.reset();
   
  }

}

editDetails(data:any)
{ 
  const body = {
  id: this.id,
  organizationName: data.name,
  organizationContactNo: data.phone
}

this.userService.changeData(`Organization/editOrganization`,body).subscribe((res)=>{
  if (res) {
    const index = this.org.findIndex((orgs:organization) => orgs.id === res.id);
    if (index !== -1) {
      this.org[index] = res;
    }
    this.alert.success("Organization Updated Successfully");
  }
});

}


deleteOrg(id: any) {
  this.loader.showLoader();
  this.userService.deleteData(`Organization/deleteOrganization?Id=${id}`).subscribe((res) => {
      if (res) {
      const indexToRemove = this.org.findIndex((orgs:organization) => orgs.id === id);
      const indexToRemoveofAllOrg = this.allOrg.findIndex((orgs:organization) => orgs.id === id);
        if (indexToRemove !== -1) {
        this.org.splice(indexToRemove, 1);
        this.alert.success("Organization Deleted Successfully");
      }
      if (indexToRemoveofAllOrg !== -1) {
        this.allOrg.splice(indexToRemove, 1);
        
      }
      if (this.org.length === 0) {
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
          this.org.length <= 0 &&
          this.org.every((orgs:organization) => orgs.isDeleted)
        ) {
          this.isAllDeleted == true;
        }
      }
    }
  });
  this.loader.hideLoader();
}
selectToDelete(index: number) {
  this.selectedOrgToDelete = this.org[index].id;
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
  
 this.org=[];
  this.currentPage = pageNumber;
  this.userService.getData(`Organization/Organizations?currentPage=${pageNumber}&defualtList=${this.defualtList}`).subscribe((res) => {
    this.org=res.organizationDetails;
    this.totalPage=res.totalPages;
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

close() {
  this.nameDeleted = false;
  this.addOrganizationForm.reset();
  this.isNameExists=false;
}

Update() {
  this.userService.changeData("Organization/enableOrg", this.Addbody).subscribe((res) => {
    this.org.push(res);
    this.nameDeleted = false
    this.getOrganizationList();
    this.getallOrganaization();
    this.goToPage(this.currentPage);
    this.updateVisiblePages();
     this.loader.hideLoader();
  })
}


checkNameExists(name: string) {

const existingNames = this.allOrg.map((allOrg: any) => allOrg.organizationName);
const existingLower = existingNames.map((existingName: string) => existingName.toLowerCase());
  const existingUpper = existingNames.map((existingName: string) => existingName.toUpperCase());
if (this.editMode) {
  const currentIndex = this.allOrg.findIndex((allOrg: any) => allOrg.id === this.id);
  existingNames.splice(currentIndex, 1);
  existingLower.splice(currentIndex, 1);
  existingUpper.splice(currentIndex, 1);
}
if (existingNames.includes(name) || existingLower.includes(name.toLowerCase()) || existingUpper.includes(name.toUpperCase())) {
    this.isNameExists = true;
  } else {
    this.isNameExists = false;
  }
}
}
 
