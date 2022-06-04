import { Controller, Get, Post, Render, Request, Res } from "@nestjs/common";
import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { Response } from "express";
import { AuthService } from "../modules/authentication/services/auth.service";
import { Token } from "../models/token.model";

@SkipThrottle()
@Controller()
export class AppController {
  /**
   * Top level controller, handles the front end GUI routes for logging in and static pages
   * @param authService
   * @author Starter Project, edited by Alex Carney
   */
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
