const fs = require('fs');

const csv = require('csv-parser');

const mysql = require('mysql2/promise');
 
const BATCH_SIZE = 1000;

const FILE_PATH = './school.csv';
 
async function runImport() {
 
    const connection = await mysql.createConnection({

        host: 'localhost',

        user: 'root',

        password: '', // change in live

        database: 'csvinsert'

    });
 
    const failedRows = [];

    let batch = [];
 
    try {
 
        console.log("Starting Import...");
 
        const stream = fs.createReadStream(FILE_PATH).pipe(csv());
 
        for await (const row of stream) {
 
            batch.push({

                id: row.id,

                name: row.name,

                logo_pic: row.logo_pic

            });
 
            if (batch.length >= BATCH_SIZE) {

                await processBatch(connection, batch, failedRows);

                batch = [];

            }

        }
 
        // Remaining rows

        if (batch.length > 0) {

            await processBatch(connection, batch, failedRows);

        }
 
        console.log("Import Completed");
 
        if (failedRows.length > 0) {

            console.log("Failed Rows:");

            console.log(failedRows);

        }
 
    } catch (error) {
 
        console.error("Fatal Error:", error);
 
    } finally {

        await connection.end();

    }

}
 
async function processBatch(connection, batch, failedRows) {
 
    await connection.beginTransaction();
 
    try {
 
        const values = batch.map(r => [r.id, r.name, r.logo_pic]);
 
        const sql = `

            INSERT INTO school_colleges (id, name, logo_pic)

            VALUES ?

        `;
 
        await connection.query(sql, [values]);
 
        await connection.commit();
 
        console.log(`Inserted ${batch.length} rows`);
 
    } catch (error) {
 
        await connection.rollback();
 
        console.log("Batch failed, checking rows individually...");
 
        for (const row of batch) {

            try {

                await connection.query(

                    `INSERT INTO school_colleges (id, name, logo_pic) VALUES (?, ?, ?)`,

                    [row.id, row.name, row.logo_pic]

                );

            } catch (rowError) {

                failedRows.push({

                    row,

                    error: rowError.message

                });

            }

        }

    }

}
 
runImport();
 