import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-email-confirmation-dialog',
  templateUrl: './email-confirmation-dialog.component.html',
  styleUrls: ['./email-confirmation-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
})
export class EmailConfirmationDialogComponent {
  email: string = '';

  constructor(
    public dialogRef: MatDialogRef<EmailConfirmationDialogComponent>
  ) {}

  confirm(): void {
    if (this.validateEmail(this.email)) {
      this.dialogRef.close(this.email);
    } else {
      alert('Por favor, insira um e-mail válido.');
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
