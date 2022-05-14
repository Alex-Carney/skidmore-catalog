import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
/**
 * A guard that can be attached to an API endpoint to require jwt authentication
 * @author Starter Project
 */
export class JwtAuthGuard extends AuthGuard('jwt') {}
