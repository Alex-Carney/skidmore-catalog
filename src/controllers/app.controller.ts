import { Controller, Get, Request, Post, Render } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Token } from 'src/models/token.model';
import { AuthService } from 'src/services/auth.service';
import { AppService } from '../services/app.service';

@SkipThrottle()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly authService: AuthService) {}

  @Get()
  @Render('home')
  @ApiExcludeEndpoint()
  root() {
    return 
  }

  @Get("/signin")
  @Render('signin')
  @ApiExcludeEndpoint()
  signin() {
    return
  }

  @Post("/signin")
  @ApiExcludeEndpoint()
  // async login(@Request() req: {email: string, password: string}): Promise<Token> { 
  async login(@Request() req: any): Promise<Token> { 
    
    return this.authService.login(req.body.email, req.body.password)
  }

  @Get("/contact")
  @Render('contact')
  @ApiExcludeEndpoint()
  contact() {
    return 
  }

  @Get("/tendril")
  @Render('tendril')
  @ApiExcludeEndpoint()
  tendril() {
    return 
  }

  @Get("/documentation")
  @Render('documentation')
  @ApiExcludeEndpoint()
  docs() {
    return 
  }
}
