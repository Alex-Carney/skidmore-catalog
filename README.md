# Instructions

This is the source code for the Skidmore College Extragalactic Catalog. Data from numerous useful catalogs/databases is stored here and can be requested by users using OpenAPI REST specifications.  

Check out the actual website at http://skidmore-datahub.us.reclaim.cloud/

Check out the video demo here: 

NOTE: This site is not online 24/7. Uptime is according to this table:

| 0:00 EST - 8:00 EST | 8:00 EST - 23:59 EST | HOURLY **:00 |
|---------------------|----------------------|--------------|
| OFFLINE             | ONLINE               | RESTART      |



# Overview

When I started doing research this summer with the Skidmore-APPSS collaboration, my greatest roadblock was handling data. There were dozens of spreadsheets containing extragalactic data, with cryptic column headers and millions of data entries with no inherent meaning to me.

Additionally, trying to access the full datasheets was a nightmare. Scattered across numerous websites and online databases, I had to parse through research papers to find the location of the publically available data.

Furthermore, most websites only hosted the files themselves, forcing you to download the entire spreadsheet instead of querying only the data needed.

Also, when working in collaboration with other researchers, I noticed that any time I tried to run their code, I would first have to change all references to file locations on local computers within the document, since everyone was downloading the entire spreadsheet onto their computer and reading it from there.

Finally, I realized that once my research was completed, I wanted it to be publicly available, and there was no way for me to do that with our current infastructure.

Starting in August, I took it upon myself to build an online hub for the Skidmore research group to share and manage spreadsheets for our data analysis projects.

Since all of our research is data driven, I wanted to create an API where my colleagues could access the same data, forgoing the need to store spreadsheets on their own computers (increasing code sharability), along with the ability to query exact data needed, without being proficient in SQL.

I also wanted to put what I learned in software engineering academic courses to the test, by building my own publicly consumed service that would make my research process easier, along with students for years to come.

# Tech Stack

Web Development:

- TypeScript: An extension to JavaScript that is strongly typed, allowing me to use concepts from my Object Oriented Programming classes for web development
- NestJS: By far my favorite JavaScript framework, used to create a scalable, enterprise grade backend
- PostgreSQL: A database to store necessary datasets, along with execute SQL searches
- Prisma: An ORM (object relational mapper) to handle database management and querying
- SwaggerUI: To build the API to OpenAPI specifications, along with providing an interactive documentation page to consume the API
- Bootstrap: To quickly create a simple UI
- PassportJS: To implement JWT authentication
- Webpack: To consolidate dozens of TypeScript files into a single JS file suitable for the web
- GitHub: To host the source code of the project, allowing it to be moved to new server environments

Hosting:

- Reclaim cloud: A cloud hosting service powered by jelastic. Skidmore College is partnered with reclaim cloud, and using my project as a "pilot" for using cloud resources to host future student projects. 
- Docker: To containerize the entire application (and the database) so that it can be hosted anywhere, with ease

Architecture:

- I used this starter project https://github.com/fivethree-team/nestjs-prisma-starter to begin my project. Therefore, I didn't have to worry about writing authorization or configuration management myself, and could focus on the actual functionality of the website. 

Tendril Finder (Research component):
- Python: The primary language for data science
- Pandas/Numpy/NetworkX/Scikit-Learn/Astropy/and more: Python packages commonly used for data science
- Jupyter Notebooks: For providing cohesive documentation to the various Python scripts used for the project
- Asana: For managing my research team



