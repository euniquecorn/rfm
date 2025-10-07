import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employees.html',
  styleUrls: ['./employees.css']
})
export class AdminEmployeesComponent implements OnInit {

  constructor() {}

  ngOnInit() {
    // All functionality removed
  }

}