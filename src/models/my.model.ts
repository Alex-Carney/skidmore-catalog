import { ApiProperty } from "@nestjs/swagger";

export class MyModel {
	@ApiProperty()
	id: string;

	@ApiProperty()
	body: string;
}