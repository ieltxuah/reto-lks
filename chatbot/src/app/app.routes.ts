import { Routes } from '@angular/router';
import { QuestionBarComponent } from './chatbot/components/question-bar/question-bar.component';

export const routes: Routes = [
  {
    path: '',
    component: QuestionBarComponent,
  },
  {
    path: ':query',
    component: QuestionBarComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
