import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { CvService } from '../../../services/cv.service';
import { environment } from '../../../../environments/environment';

interface JobOffer {
    id?: number;
    title: string;
    description: string;
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
    salary?: number;
    currency?: string;
    active?: boolean;
    requiredSkills?: string[];
}

@Component({
    selector: 'app-public-jobs',
    templateUrl: './public-jobs.component.html'
})
export class PublicJobsComponent implements OnInit {
    jobs: JobOffer[] = [];
    loading = true;
    error: string | null = null;
    success: string | null = null;
    isCandidate = false;
    appliedJobs: { [jobId: number]: { applied: boolean, score?: number } | undefined } = {};
    candidateId: string | null | undefined = null;

    constructor(
        private http: HttpClient, 
        private router: Router, 
        private authService: AuthService,
        private cvService: CvService
    ) { }

    ngOnInit() {
        this.isCandidate = this.authService.hasRole('CANDIDATE');
        const userInfo = this.authService.getUserInfo();
        this.candidateId = userInfo ? userInfo.id : null;

        this.http.get<JobOffer[]>(`${environment.apiUrl}/api/jobs/all`).subscribe({
            next: jobs => {
                this.jobs = jobs;
                this.loading = false;
                if (this.isCandidate && this.candidateId) {
                    this.loadCandidateMatches();
                }
            },
            error: () => { this.error = 'Could not load job offers. Please try again later.'; this.loading = false; }
        });
    }

    loadCandidateMatches() {
        if (!this.candidateId) return;
        this.cvService.getLatestMatchesByCandidate(this.candidateId).subscribe({
            next: matches => {
                matches.forEach(m => {
                    if (m.jobOffer && m.jobOffer.id) {
                        this.appliedJobs[m.jobOffer.id] = { applied: true, score: Math.round(m.matchScore || 0) };
                    }
                });
            },
            error: () => console.log('New candidate: no matches yet.')
        });
    }

    onFileSelected(event: Event, jobId: number) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            if (!this.candidateId) {
                this.error = 'You must be logged in as a candidate to apply.';
                return;
            }

            const userInfo = this.authService.getUserInfo();
            const firstName = userInfo?.firstName;
            const lastName = userInfo?.lastName;
            const email = userInfo?.email;

            this.cvService.uploadCV(file, this.candidateId, jobId, firstName, lastName, email).subscribe({
                next: (res: any) => {
                    const score = res.matchScore ? Math.round(res.matchScore) : 0;
                    this.appliedJobs[jobId] = { applied: true, score: score };
                    this.success = `CV submitted! AI compatibility: ${score}%`;
                    setTimeout(() => this.success = null, 6000);
                },
                error: (err: any) => {
                    this.error = err.error || 'Failed to submit CV. Please try again.';
                    setTimeout(() => this.error = null, 6000);
                }
            });
            input.value = '';
        }
    }

    signUpToApply() {
        this.authService.register();
    }
}
