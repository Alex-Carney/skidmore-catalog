import { Controller, Get, Post, Render, Request, Res } from "@nestjs/common";
import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { Token } from "src/models/token.model";
import { AuthService } from "src/modules/authentication/services/auth.service";
import { Response } from "express";

@SkipThrottle()
@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {
  }

  @Get()
  @Render("home")
  @ApiExcludeEndpoint()
  root() {
    return;
  }

  @Get("/signin")
  @Render("signin")
  @ApiExcludeEndpoint()
  signin() {
    return { status: "Please Sign In" };
  }

  @Post("/signin")
  @ApiExcludeEndpoint()
  // async login(@Request() req: {email: string, password: string}): Promise<Token> {
  async login(@Request() req: any, @Res() res: Response) { //formerly : Promise<Token>

    /**
     * Better way of handling promises that may or may not be rejected.
     */
    await this.authService.login(req.body.email, req.body.password).then((token) => {
      return res.render(
        "token",
        { token: token }
      );
    }).catch((err) => {
      return res.render(
        "signin",
        { status: err }
      );
    });

  } //end

  @Post("/authorize")
  @ApiExcludeEndpoint()
  async loginRemote(@Request() req: any): Promise<Token> {
    return this.authService.login(req.body.email, req.body.password);
  }


  @Get("/contact")
  @Render("contact")
  @ApiExcludeEndpoint()
  contact() {
    return;
  }

  @Post("/contact")
  @ApiExcludeEndpoint()
  async createAccount(@Request() req: any): Promise<Token> {
    return this.authService.createUser(req.body.email, req.body.password, req.body.fname, req.body.lname);
  }

  @Get("/tendril")
  @Render("tendril")
  @ApiExcludeEndpoint()
  tendril() {
    return;
  }

  @Get("/documentation")
  @Render("documentation")
  @ApiExcludeEndpoint()
  docs() {
    return;
  }
}
