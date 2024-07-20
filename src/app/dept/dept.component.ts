import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { Observable } from 'rxjs';

interface Department {
  departmentId?: number;
  departmentName: string;
  departmentDescription?: string;
  createdDate?: string;
  createdBy?: string;
}

declare var $: any;

@Component({
  selector: 'app-dept',
  templateUrl: './dept.component.html',
  styleUrls: ['./dept.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeptComponent implements OnInit {
  @ViewChild('addDialog') addDialog!: ElementRef;
  departmentId: number | null = null;
  departmentName: string = '';
  departmentDescription: string = '';
  gridData: any[] = [];

  selectedDepartment: Department | null = null;
  userList: Department[] = [];
  colDefs: (ColDef | ColGroupDef)[];
  gridOptions: GridOptions;
  gridApi!: GridApi;

  public defaultColDef: ColDef = {
    editable: true,
    filter: true,
  };
  public themeClass: string = 'ag-theme-quartz';
  createdBy: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.gridOptions = {
      rowHeight: 50,
      defaultColDef: {
        width: 150,
      },
    };

    this.colDefs = [
      { field: 'departmentName', headerName: 'Dept' },
      { field: 'departmentDescription', headerName: 'Description' },
      { field: 'createdDate', headerName: 'Created Date', valueFormatter: this.dateFormatter },
      { field: 'createdBy', headerName: 'Created By' },
      {
        headerName: 'Action',
        cellRenderer: this.actionButtonRenderer.bind(this),
      },
    ];

    this.onDeleteButtonClick = this.onDeleteButtonClick.bind(this);
    this.onEditButtonClick = this.onEditButtonClick.bind(this);
    this.onViewButtonClick = this.onViewButtonClick.bind(this);
  }

  ngOnInit(): void {
    this.fetchData();
  }

  openAddDialog(): void {
    this.departmentId = null;
    this.departmentName = '';
    this.departmentDescription = '';
    this.createdBy = '';
    $('#addModal').modal('show');
  }

  openEditDialog(department: Department): void {
    this.departmentId = department.departmentId ?? null;
    this.departmentName = department.departmentName;
    this.departmentDescription = department.departmentDescription ?? '';
    $('#addModal').modal('show');
  }

  dateFormatter(params: any): string {
    const date = new Date(params.value);
    return date.toLocaleDateString(); // Format the date to display only the date part
  }

  onSubmit(): void {
    if (!this.departmentName || !this.departmentDescription) {
      console.error('Error: DepartmentName and DepartmentDescription are required.');
      return;
    }

    const formData: Department = {
      departmentId: this.departmentId ? Number(this.departmentId) : undefined,
      departmentName: this.departmentName,
      departmentDescription: this.departmentDescription,
      createdDate: this.selectedDepartment?.createdDate,
      createdBy: this.createdBy,
    };

    if (this.departmentId) {
      this.http.put<Department>(`https://localhost:7188/api/Dept/${this.departmentId}`, formData)
        .subscribe(
          (response: Department) => {
            console.log('Data updated successfully:', response);
            const index = this.userList.findIndex(dept => dept.departmentId === this.departmentId);
            if (index !== -1) {
              this.userList[index] = response;
              this.gridApi.applyTransaction({ update: [response] });
            }
            this.refreshTable();
            this.fetchData();
            this.closeAddDialog();
            this.departmentId = null;
          },
          (error) => {
            console.error('Error updating data:', error);
            if (error.error && error.error.errors) {
              console.error('Validation errors:', error.error.errors);
            }
          }
        );
    } else {
      this.http.post<Department>('https://localhost:7188/api/Dept', formData)
        .subscribe(
          (response: Department) => {
            console.log('Data added successfully:', response);
            this.userList.push(response);
            this.refreshTable();
            this.closeAddDialog();
            this.departmentName = '';
            this.departmentDescription = '';
            this.createdBy = '';
          },
          (error) => {
            console.error('Error adding data:', error);
            if (error.error && error.error.errors) {
              console.error('Validation errors:', error.error.errors);
            }
          }
        );
    }
  }

  closeAddDialog(): void {
    $('#addModal').modal('hide');
    this.departmentId = null;
    this.departmentName = '';
    this.departmentDescription = '';
    this.createdBy = '';
  }

  fetchData(): void {
    this.getDepartments().subscribe(
      (data: any) => {
        console.log('Fetched data:', data); // Log the fetched data
        if (data && data.$values && Array.isArray(data.$values)) {
          const departments = data.$values; // Accessing the array of departments from $values
          const employeeNames = ['Alice cheril', 'Bob ekmes', 'Charlie tharan', 'David kumar']; // Hardcoded employee names
          this.userList = departments.map((dept: any, index: number) => ({
            ...dept,
            createdBy: employeeNames[index % employeeNames.length], // Assigning names cyclically
          }));
          this.refreshTable();
          this.cdr.detectChanges();
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
    return this.http.get<any>('https://localhost:7188/api/Dept'); // Adjust API endpoint as necessary
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
      this.onViewButtonClick(params.data.departmentId);
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

  onViewButtonClick(departmentId: number): void {
    if (departmentId == null) {
      console.error('Error: Department ID is undefined or null.');
      return;
    }

    console.log('Viewing department ID:', departmentId);

    this.http.get<Department>(`https://localhost:7188/api/Dept/${departmentId}`)
      .subscribe(
        (data) => {
          console.log('Fetched department details:', data);
          this.selectedDepartment = data;
          console.log('Selected Department:', this.selectedDepartment); // Log the selected department
          this.cdr.detectChanges(); // Ensure change detection
          $('#descriptionModal').modal('show');
        },
        (error) => {
          console.error('Error fetching department details:', error);
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

  onDeleteButtonClick(params: any): void {
    console.log('params:', params);
    console.log('params.data:', params.data);
    if (!params || !params.data) {
      console.error('Error: params or params.data is undefined or null.');
      return;
    }
    const departmentId = params.data.departmentId;
    if (departmentId !== undefined && departmentId !== null) {
      console.log('Found departmentID:', departmentId);
      this.http.delete(`https://localhost:7188/api/Dept/${departmentId}`)
        .subscribe(
          () => {
            console.log('Data deleted successfully');
            this.refreshTable();
            this.fetchData();
          },
          (error) => {
            console.error('Error deleting data:', error);
          }
        );
    } else {
      console.error('Error: departmentID is undefined, null, or not present in params.data.');
    }
  }

  onEditButtonClick(params: any): void {
    const department = params.data;
    console.log('Editing department:', department);
    this.openEditDialog(department);
  }
}
