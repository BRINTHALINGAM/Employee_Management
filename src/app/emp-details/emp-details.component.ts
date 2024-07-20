import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { Observable } from 'rxjs';

interface Department {
  departmentId: number;
  departmentName: string;
}

interface Employee {
  employeeId?: number;
  employeeName: string;
  departmentId?: number;
  departmentName: string;
  salary: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  department: {
    departmentId: number;
    departmentName: string;
    departmentDescription: string;
    createdDate: string; 
  };
}


  declare var $: any;


@Component({
  selector: 'app-emp-details',
  templateUrl: './emp-details.component.html',
  styleUrl: './emp-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class EmpDetailsComponent implements OnInit {
  @ViewChild('addDialog') addDialog!: ElementRef;

  employeeID?: number;
  employeeName: string= '';
  salary : string= '';
 firstName : string= '';
 lastName : string= '';
  email : string= '';
  userName: string= '';
  departmentId?: number;
  departmentName: string = '';
  gridData: any[] = [];
  departments: Department[] = [];

  selectedEmployee: Employee | null = null;
  userList: Employee[] = [];
  colDefs: (ColDef | ColGroupDef)[];
  gridOptions: GridOptions;
    gridApi!: GridApi;
  
  
  public defaultColDef: ColDef = {
  editable: true,
  filter: true,
  };
  public themeClass: string = "ag-theme-quartz";
  
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
  this.gridOptions = {
  rowHeight: 50,
  defaultColDef: {
  width: 150,
  },
  
  };
  
  
  this.colDefs = [
    { field: 'employeeName', headerName: ' Name' },
    { field: 'email', headerName: 'Email' },
    { field: 'departmentName', headerName: ' Dept' },
    { field: 'salary', headerName: 'Salary' },
    { field: 'firstName', headerName: 'FirstName' },
    { field: 'lastName', headerName: 'LastName' },
    { field: 'userName', headerName: 'User' },

  
    {
      headerName: 'Action',
      cellRenderer: this.actionButtonRenderer.bind(this),
      width: 290,
    }
  ];
  
  this.onDeleteButtonClick = this.onDeleteButtonClick.bind(this);
  this.onEditButtonClick = this.onEditButtonClick.bind(this);
  this.onViewButtonClick = this.onViewButtonClick.bind(this);
  }
  
  ngOnInit(): void {
  this.fetchData();
  this.fetchDepartments(); 
  
  }

  fetchDepartments(): void {
    this.http.get<any>('https://localhost:7188/api/Dept')
      .subscribe(
        (data: any) => {
          console.log('Fetched departments:', data);
          if (data && data.$values && Array.isArray(data.$values)) {
            this.departments = data.$values.map((dept: any) => ({
              departmentId: dept.departmentId,
              departmentName: dept.departmentName
            }));
          } else {
            console.error('Invalid data structure:', data);
          }
        },
        (error) => {
          console.error('Error fetching departments:', error);
        }
      );
  }

  onDepartmentChange(): void {
    const selectedDepartment = this.departments.find(dept => dept.departmentName === this.departmentName);
    if (selectedDepartment) {
      this.departmentId = selectedDepartment.departmentId;
      console.log('Selected Department ID:', this.departmentId);
    } else {
      console.error('Department not found for name:', this.departmentName);
    }
  }
  
  openAddDialog(): void {
    this.clearForm();
    this.departmentId = 0;
    // Ensure departments are fetched if not already fetched
    if (this.userList.length === 0) {
      this.fetchDepartments();
    }
  
    $('#addModal').modal('show');
    console.log('Department ID on openAddDialog:', this.departmentId); // Check the value when opening the dialog
  }
  
  openEditDialog(employee: Employee): void {
    if (employee.employeeId !== undefined) {
      this.employeeID = employee.employeeId;
      this.employeeName = employee.employeeName;
      this.departmentId = employee.departmentId ?? undefined;
      this.departmentName = employee.departmentName;
      this.salary = employee.salary;
      this.firstName = employee.firstName;
      this.lastName = employee.lastName;
      this.email = employee.email;
      this.userName = employee.userName;

      $('#addModal').modal('show');
    console.log('Department ID on openEditDialog:', this.departmentId); // Check the value when opening the dialog for editing
  } else {
    console.error('Error: Employee ID is undefined.');
  }
}
  clearForm(): void {
    this.employeeID = undefined;
    this.employeeName = '';
    this.departmentId = undefined;
    this.departmentName = '';
    this.salary = '';
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.userName = '';
  }

  

  onSubmit(): void {
    console.log('Employee Name:', this.employeeName);
    console.log('Department ID:', this.departmentId);
    console.log('Department Name:', this.departmentName);

  //  const departmentId = this.departmentId !== undefined ? Number(this.departmentId) : 0;

  
    if (!this.employeeName || !this.departmentId || !this.departmentName) {
      console.error('Error: EmployeeName, DepartmentId, and DepartmentName are required.');
      return;
    }
    const formData: Employee = {
      employeeId: this.employeeID,
      employeeName: this.employeeName,
      departmentId: this.departmentId ?? undefined,
      departmentName: this.departmentName,
      salary: this.salary,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      userName: this.userName,
      department: {
        departmentId: this.departmentId ?? undefined,
        departmentName: this.departmentName,
        departmentDescription: '', // Optional: You can set a description dynamically
        createdDate: new Date().toISOString().split('T')[0], // Ensure only date part is sent
      }
    };
    
    console.log('Form Data:', formData);


    if (this.employeeID) {
      console.log('Employee ID:', this.employeeID); // Verify the employeeID before making the request
console.log(this.http.put<Employee>(`https://localhost:7188/api/Emp/${this.employeeID}`, formData));
      // Assuming you have updated Employee successfully and received a response:
this.http.put<Employee>(`https://localhost:7188/api/Emp/${this.employeeID}`, formData)
.subscribe(
  (response: Employee) => {
    console.log('Data updated successfully:', response);
    const updatedIndex = this.userList.findIndex(emp => emp.employeeId === response.employeeId);
    if (updatedIndex !== -1) {
      this.userList[updatedIndex] = response; // Update the existing array element
      this.gridApi.applyTransaction({ update: [response] }); // Apply the update to AG Grid
      this.refreshTable(); // Refresh the table view
    }
    this.fetchData(); // Fetch updated data if needed
    this.closeAddDialog();
    this.clearForm();
  },
  (error: HttpErrorResponse) => {
    console.error('Error updating data:', error);
    if (error.status === 400) {
      console.log('Validation errors:', error.error.errors);
      // Handle validation errors in UI if needed
    } else {
      console.error('Server error:', error.error);
    }
  }
);

    } else {
      this.http.post<Employee>('https://localhost:7188/api/Emp', formData)
        .subscribe(
          (response: Employee) => {
            console.log('Data added successfully:', response);
            this.userList.push(response);
            this.refreshTable();
            this.fetchData();
            this.closeAddDialog();
            this.clearForm();

          },
          (error: HttpErrorResponse) => {
            console.error('Error adding data:', error);
            if (error.status === 400) {
              console.log('Validation errors:', error.error.errors);
            } else {
              console.error('Server error:', error.error);
            }
          }
        );
    }
    
  }

  closeAddDialog(): void {
    $('#addModal').modal('hide');
   
  }

  fetchData(): void {
this.getDepartments()
      .subscribe(
        (data: any) => {
          console.log('Fetched data:', data); // Log the fetched data
          if (data && data.$values && Array.isArray(data.$values)) {
            this.userList = data.$values; // Extract the array from $values
            console.log('User list:', this.userList);
            this.refreshTable(); // Refresh table with fetched data
            this.cdr.detectChanges(); // Detect changes
          } else {
            console.error('Invalid data structure:', data);
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
      
  }
  getDepartments(): Observable<any> {
    return this.http.get<any>('https://localhost:7188/api/Emp'); // Adjust API endpoint as necessary
  }
  

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onCellValueChanged(event: any): void {
    console.log('Cell value changed:', event);
  }

  actionButtonRenderer(params: any): HTMLDivElement {
    const container = document.createElement('div');

    const viewButton = document.createElement('button');
    viewButton.innerHTML = '<i class="fa-solid fa-eye"></i>';
    viewButton.className = 'btn btn-info me-2';
    viewButton.style.border = 'none';
    viewButton.style.backgroundColor = 'transparent';
    viewButton.style.color = '#17a2b8';
    viewButton.addEventListener('click', () => {
      this.onViewButtonClick(params.data.employeeId);
    });

    const editButton = document.createElement('button');
    editButton.innerHTML = '<i class="fa-solid fa-user-pen"></i>';
    editButton.className = 'btn btn-primary me-2';
    editButton.style.border = 'none';
    editButton.style.backgroundColor = 'transparent';
    editButton.style.color = '#007bff';
    editButton.addEventListener('click', () => {
      this.onEditButtonClick(params);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteButton.className = 'btn btn-danger';
    deleteButton.style.border = 'none';
    deleteButton.style.backgroundColor = 'transparent';
    deleteButton.style.color = '#dc3545';
    deleteButton.addEventListener('click', () => {
      this.onDeleteButtonClick(params);
    });

    container.appendChild(viewButton);
    container.appendChild(editButton);
    container.appendChild(deleteButton);

    return container;
  }

  onViewButtonClick(employeeId: string): void {
    console.log('Received employee ID:', employeeId); // Check the received employee ID
    if (!employeeId) {
      console.error('Employee ID is undefined or null.'); // Log error if employeeId is not valid
      return;
    }
  
    console.log('Viewing employee ID:', employeeId);
  
    this.http.get<Employee>(`https://localhost:7188/api/Emp/${employeeId}`)
      .subscribe(
        (data) => {
          console.log('Fetched employee details:', data);
          this.selectedEmployee = data;
          this.cdr.detectChanges();
          $('#descriptionModal').modal('show');
        },
        (error) => {
          console.error('Error fetching employee details:', error);
        }
      );
  }
  

  onDeleteButtonClick(params: any): void {
    const employeeId = params?.data?.employeeId; // Access employeeId from params.data safely
    if (!employeeId) {
      console.error('Error: Employee ID is undefined or null.');
      return;
    }
  
    console.log('Found employeeID:', employeeId);
    this.http.delete(`https://localhost:7188/api/Emp/${employeeId}`)
      .subscribe(
        () => {
          console.log('Data deleted successfully');
          this.refreshTable();
          this.fetchData(); // Fetch updated data after deletion
        },
        (error) => {
          console.error('Error deleting data:', error);
        }
      );
  }
  



  refreshTable(): void {
    this.cdr.detectChanges();
    if (this.gridApi) {
      this.gridApi.updateGridOptions({ rowData: [...this.userList] });
      console.log('Grid data refreshed:', this.userList);
    } else {
      console.warn('Grid API is not available.');
    }
  }

  onEditButtonClick(params: any): void {
    const employee = params.data;
    this.openEditDialog(employee);

  }
}