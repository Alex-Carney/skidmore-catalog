import { Body, Controller, Delete, Get, Patch, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { Request } from "express";
import { UserAddRoleDTO } from "src/resolvers/user/dto/add-role.dto";
import { DeleteRoleDTO } from "src/resolvers/user/dto/delete-role.dto";
import { UpdateRoleAdminDTO } from "src/resolvers/user/dto/update-admin.dto";
import { AuthService } from "src/services/auth.service";
import { RoleService } from "src/services/role.service";
import { UserService } from "src/services/user.service";


    /**
     * In the API V2 architecture, resources are not controlled based on the user that uploaded them, but rather the ROLE that they were assigned
     * Therefore, the "users" themselves are not very important, they are just a way to login to access certain roles -- the roles provide access
     * to the actual resources. 
     * 
     * Therefore, the only functions for users are viewing their roles + adding new roles 
     */



@ApiBearerAuth()
@Controller('user-roles')
export class UserController {

    constructor(private readonly userService: UserService, private readonly authService: AuthService, private readonly roleService: RoleService) {}

    //--------------------------------------------------------------------------------------------------------------

    @ApiTags('User Roles')
    @ApiBearerAuth()
    @Get() 
    async viewRoles(@Req() req: any): Promise<any> {
        const user = await this.userService.getUserFromRequest(req);
        return this.roleService.getUserRoles(user['id']);
    }

    @ApiTags('User Roles')
    @ApiBearerAuth()
    @ApiBody({
        description: "test",
        type: UserAddRoleDTO,
    })
    @Post()
    async addRoles(@Req() req: Request, @Body() addRoleDto: UserAddRoleDTO): Promise<User> {
        // console.log(addRoleDto);
        // console.log(addRoleDto.roles);
        // const authHeader = req.headers['authorization'];
        // const token = authHeader.split(' ')[1]; 
        // const userId = await this.authService.getUserFromToken(token).then(response => {
        //     return response['id']
        // }).catch(err => {
        //     console.log(err);
        //     return err;
        // });
        const user = await this.userService.getUserFromRequest(req);
        //const payload = await this.userService.updateRoles(user['id'], addRoleDto.roles, false);
        //return payload['roles'];

        return this.roleService.upsertRoles(user['id'], addRoleDto.roles);
    }

    @ApiTags('User Roles')
    @ApiBearerAuth()
    @ApiBody({
        description: "test",
        type: UpdateRoleAdminDTO
    })
    @Patch()
    async updateRoleAdmins(@Req() req: Request, @Body() updateAdminDto: UpdateRoleAdminDTO): Promise<any> {
        const user = await this.userService.getUserFromRequest(req);
        return this.roleService.updateRoleAdmins(user['id'], updateAdminDto)
    }



    @ApiTags('User Roles')
    @ApiBearerAuth()
    @ApiBody({
        description: "test",
        type: DeleteRoleDTO,
    })
    @Delete()
    async deleteRole(@Req() req: Request, @Body() removeRoleDto: DeleteRoleDTO): Promise<any> {
        const user = await this.userService.getUserFromRequest(req);
        return this.roleService.deleteRole(user['id'], removeRoleDto.role);
    }
}

