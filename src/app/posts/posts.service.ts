import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Subject }from 'rxjs';
import { map } from 'rxjs/operators';

import {Router} from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { identifierName } from "@angular/compiler";
import { throwToolbarMixedModesError } from "@angular/material/toolbar";
@Injectable({providedIn: 'root'})

export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], totalPosts: number}>();

  constructor(private http: HttpClient, private router: Router){}

  getPostUpdateListener()
  {
    return this.postsUpdated.asObservable();
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{message: string, posts: any, totalPosts: number}>('http://localhost:3000/api/posts'+ queryParams)
    .pipe(map((postData:any) => {
      return { posts: postData.posts.map((post: any) => {
        return {
          title: post.title,
          content: post.content,
          id: post._id.toString(),
          imagePath: post.imagePath
        };
      }),
      totalPosts: postData.totalPosts
    }
    }))
    .subscribe((postsList)=>{
      this.posts = postsList.posts;
        this.postsUpdated.next({posts: [...this.posts], totalPosts: postsList.totalPosts})
      })
  }

  getPost(id: string){
    return this.http.get<{_id: string, title: string, content: string, imagePath: string}>("http://localhost:3000/api/posts/" + id)
  }

  setPost(post: Post, image: File){
    const postData = new FormData();
    postData.append("title", post.title!)
    postData.append("content", post.content!)
    postData.append("image", image, post.title)
    this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
    .subscribe((responseData) => {
      this.router.navigate(["/"]);
    })
  }

  updatePost(id: string, post: Post, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image)==='object') {
      postData = new FormData();
      postData.append("id", post.id!)
      postData.append("title", post.title!)
      postData.append("content", post.content!)
      postData.append("image", image, post.title)
    }
    else {
      postData = {
        id: post.id,
        title: post.title,
        content: post.content,
        imagePath: image
      }
    }
    this.http.put('http://localhost:3000/api/posts/' + id, postData)
    .subscribe((response) =>{
      this.router.navigate(["/"]);
    })
  }

  deletePost(postId: string){
    return this.http.delete('http://localhost:3000/api/posts/' + postId)
  }
}
