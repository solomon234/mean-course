import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { mimeType } from './mime-type.validator';
@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit {
  postCreated = new EventEmitter<Post>();
  private mode = 'create';
  private postId: string | undefined;
  post: Post | undefined;
  isLoading = false;
  form: FormGroup | undefined;
  imagePreview: string | undefined;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators:[Validators.required], asyncValidators: [mimeType]})
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId') ?? undefined;
        this.isLoading = true;
        if (this.postId) {
          this.postsService.getPost(this.postId).subscribe((postData) => {
            this.post = {
              id: postData._id,
              title: postData.title,
              content: postData.content,
              imagePath: postData.imagePath
            };
            this.form?.setValue({
              title: this.post.title,
              content: this.post.content,
              image: this.post.imagePath
            });
            this.isLoading = false;
          });
        }
      }
    });
  }

  onImagePicked(event: Event){
    const file = (event.target as HTMLInputElement).files![0];
    this.form?.patchValue({image: file});
    this.form?.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = (reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form?.invalid) return;
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.setPost({
        title: this.form?.value.title,
        content: this.form?.value.content,
        imagePath: this.form?.value.image
      },
      this.form?.value.image);
      this.form?.reset();
      this.isLoading = false;
    } else {
      this.postsService.updatePost(this.post?.id!, {
        title: this.form?.value.title,
        content: this.form?.value.content,
        imagePath: null
      }, this.form?.value.image);
    }
  }

}
