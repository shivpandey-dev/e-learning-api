import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // store numeric(10,2) as string to avoid JS float issues
  @IsOptional()
  @IsNumberString()
  price?: string;

  // optional explicit slug; if omitted, service will generate from title
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be kebab-case (letters, numbers and dashes only)',
  })
  slug?: string;

  // optional: attach to a branch
  @IsOptional()
  @IsString()
  branchId?: string;

  // teacher taken from req.user by default (role must be teacher/admin)
  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
