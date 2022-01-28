# Resources

Resources are the core feature of the catalog. A resource is essentially a spreadsheet of data that can be queried with the web API. In order to add a resource to the website, you'll first need the raw data, in csv form. 

You'll also need access to the backend postgreSQL database, which is hosted in its own docker container. pgAdmin4 connected to that container makes it incredibly easy to seed the database with new information. Without pgadmin4 it's a little harder, so you'll need docker CLI access, and need to import the csv file into the docker container itself. 

- - - -

# Steps to add a new resource

## 1) Create a model in Prisma 
- Open the file you wish to add as a resource and become accustomed to the column names, and what they mean. During this time, take note of any *NULLABLE* fields (those that have empty entries), and identify the *UNIQUE ID FIELD*. You will need to know this.
- Next, open up the **schema.prisma** file in the project. Read over the comments there to understand what it does in more detail, but basically the schema file is the backbone of our prisma client, which is what interacts with the database for us.
- define a new model with the name of your resource + field properties. Make sure to use a consistent naming convention. (AUTHOR/CATALOG) _ (RESOURCE TYPE)
- In order to complete the boilerplate code, use the python program and run it. Point the script to the excel file you're uploading, and it will automatically extract the column names and create the model for you. (AND THE DTO FILE FOR LATER). The model will be copied to your clip board, and the Dto file scaffold will be written in a new (or existing) file path of your choice. 
- When defining your model, make sure to use decorators (@) where needed. (@id is REQUIRED for 1 column. @unique helps but isnt required)
- NULLABLE FIELDS are marked with (datatype)?
- **IMPORTANT:** DO NOT USE CAPS IN YOUR MODEL NAMES! postgreSQL doesn't like it and will cause you issues down the line. 
- Once you are done, run the following commands: 
   - ```npx prisma migrate dev``` OR ```npm run migrate:dev```
   - ```npx prisma generate``` OR ```npm run prisma:generate```

## 2) Seed the database

Seeding means adding the data to the database

WITH PGADMIN4 CONNECTED TO THE DATABASE:

- Navigate to the table that was just created for your resource
- In the top left of pgadmin4, underneath FILE/OBJECT/TOOLS/HELP you will see tabs. Hover over them to see their names. Find QUERY TOOL and PSQL TOOL
- in pgadmin4, open the PSQL tool. You will see a command line interface
- BELOW: Copy a csv file into skidmore-catalog postgres db:
  **WARNING: Make sure your csv file has the same schema as the one you defined (similar column names and column order)**
 ``` \copy {name of table copying into}({col1_name, col2_name}) from {local file location.csv} delimiter ',' csv header; ```
 EXAMPLE:
 ``` \copy universe."Tully_Group"(nest, num_members, pcg_name, sg_lon, sg_lat, log_lk, v_mod, dist_mod, sig_v, r2t, sigmap, mass, cf) from C:\Users\Alex\Tully_groups_full.csv delimiter ',' csv header; ``` 

**Warning: Do not forget .csv at the end of your file path**

If you are successful, the command line will say "COPY (number of rows in the csv file)" 
To confirm, open up the QUERY TOOL and type ```SELECT * FROM universe."(table name)"```

## 3) Create the DTO for your resource 

A DTO is a data transfer object, which is used primarily by SwaggerUI to define what kind of queries users will be inputting, and what kind of resource you are hosting

- Create a new folder in resources/ for your resource
- Create a new folder 'dto' 
- Create (resource name).dto.ts 
- Using the python script, add the **ENUM** and **CLASS** for your resource
- Using the python script, add the **QUERY** and **FIELD SELECT** DTOs for your resource 
  **WARNING: MAKE SURE YOU CHANGE THE enumName PROPERTY OF YOUR QUERIES. The names don't matter but they have to be unique**


## 4) Add your resource to the API (Default) 

Before you work through this, there are some helpful resources you should look through. If you just want to copy existing code as a scaffold and change the names, you probably don't need extra resources, but if you want an additional explanation of what's going on, this is what I used:

- https://www.youtube.com/watch?v=F_oOtaxb0L8&t=3711s goes over the basics of REST API design, and how to implement it in Nest (1h)
- https://docs.nestjs.com/first-steps Read through CONTROLLERS/MODULES. Read through PROVIDERS if you dont want to use the custom one
- https://docs.nestjs.com/fundamentals/custom-providers for more information about how the custom provider works (and the factory that creates it)
- https://docs.nestjs.com/openapi/introduction if you're having any issues with SwaggerUI 

These instructions apply if you want your resource to have *a subset of* the default query options, which are: 

- RETURN ALL
- RETURN 1 BY ID
- RETURN ALL BY CUSTOM QUERY
- RETURN ALL BY SQL
- RETURN BY LOCATION - FILE UPLOAD
  
If you want a way to query your resource that isn't in the above list, you'll have to make your own service (see Step 3 (Custom)). Otherwise, you can use my custom provider DatabaseLookupService

- Generate the scaffold for a new resource using ```nest g resource (resource name)``` in your CMD 
- Move the newly generated folder to the resources folder 
- Delete the resource.service file and the resource.service.spec file (there will be errors that arise because of this, resolve them by deleting imports that require this file) 
- Next, set up everything you will need in the **RESOURCE OPTIONS** folder. Add your resource to the constants.ts file, and your interface to the resource-options interface. You can use existing code as a scaffold
- Next, define the MODULE. Use another resource as a scaffold. Since your resource will have the default options, the *provider* will be handled by the custom provider, you just have to put the right object in the class brackets <> 
- Finally, create the CONTROLLER. Use existing controllers as a scaffold. 
    - Add @ApiUseGuards(JwtAuthGuard) and @ApiBearerAuth as decorators to your endpoint if you want it to be account-locked 
    - THE ORDER IN WHICH you write your controllers does matter. Have the shortest URLs at the top, and order them by increasing length
      - Additionally, static links come before dynamic ones. That means if you have /resource/custom it comes BEFORE /resource/:param

