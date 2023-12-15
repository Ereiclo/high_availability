# Examen - Ing Soft II UTEC

- Eric Bracamonte 

![](./arquitectura.jpg)

# Environment 

Si se quiere levantar el proyecto se debe tener un archivo **.env** con el siguiente formato:

```
TURSO_URL={}
TURSO_AUTH_TOKEN={}
BASE_PORT={}
URL={}
N=8
MAX_REQUESTS=20000
```

La base de datos tiene que tener una tabla data (name:string,value:string). Una vez se tenga todo eso, se debe ejecutar lo siguiente (cada comando en una terminal diferente):

```bash
node balancer.js
node startServices.js
```

# Cron job

El archivo cronJob consigue los nombres de todos los animes en la base de datos. Luego cada 1.5, por cada anime que existe, se hace una consulta en jikan y se actualiza el campo value. Para ejecutarlo solo debe hacer: 

```
node cronJob.mjs
```

