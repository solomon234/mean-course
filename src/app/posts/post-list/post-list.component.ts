
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";

import { Post } from '../post.model'
import { PostsService } from "../posts.service";

@Component(
  {
    selector:'app-post-list',
    templateUrl:'./post-list.component.html',
    styleUrls: ['./post-list.component.scss']
  })

export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 1;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  private postsSub: Subscription = new Subscription();

  constructor(public postsService: PostsService){}

  ngOnInit() {
    this.isLoading = true
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: {posts: Post[], totalPosts: number}) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.totalPosts;
      });
  }

  onChangedPage(pageData: PageEvent){
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: any){
    this.postsService.deletePost(postId).subscribe(()=>{
      this.postsService.getPosts(this.postsPerPage,this.currentPage)
    }) ;
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }
}
