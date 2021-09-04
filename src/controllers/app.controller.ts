import { Controller, Get, Request, Post, Render } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Token } from 'src/models/token.model';
import { AuthService } from 'src/services/auth.service';
import { AppService } from '../services/app.service';

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
  async login(@Request() req): Promise<Token> { 
    console.log(req);
    
    console.log(req.body);
    
    console.log(req.body.email);
    console.log(req.body.password);
    
    
    return this.authService.login(req.body.email, req.body.password)
  }
}
