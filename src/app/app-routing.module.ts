import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeptComponent } from './dept/dept.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { EmpDetailsComponent } from './emp-details/emp-details.component';

const routes: Routes = [
  { path : 'dept', component : DeptComponent},
  { path : 'side', component : SideNavComponent},
  { path : 'emp', component : EmpDetailsComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
