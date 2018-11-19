import psycopg2
import os
import re


class AbsLoader:
    def __init__(self, db_name, db_user, db_password, db_host, abs_data_path, state, area_types, load_schema, table_codes):
        self.db_name = db_name
        self.db_user = db_user
        self.db_password = db_password
        self.db_host = db_host
        self.abs_data_path = abs_data_path
        self.state = state
        self.area_types = area_types
        self.load_schema = load_schema
        self.table_codes = table_codes

        # Create DB Connection
        self.conn = self.create_connection()
        self.cur = self.conn.cursor()

    STRING_FIELDS = ['sa1_7digitcode_2016', 'sa2_maincode_2016', 'sa3_code_2016', 'sa4_code_2016']

    def create_connection(self):
        return psycopg2.connect(
            "dbname='{db_name}' user='{user}' password='{password}' host='{host}'".format(
                db_name=self.db_name,
                user=self.db_user,
                password=self.db_password,
                host=self.db_host
            )
        )

    def get_column_def(self, column_name):
        if column_name in self.STRING_FIELDS:
            return '{} character varying'.format(column_name)
        else:
            return '{} double precision'.format(column_name)

    def process_csv_file(self, csv_path):
        with open(csv_path) as csv_contents:
            header = csv_contents.readline()
            column_names = [x.lower() for x in header.replace('\r\n','').split(',')]
            table_name = 'abs_{}'.format(os.path.basename(csv_path).rsplit('.', 1)[0].lower())
            create_table_sql = \
                'DROP TABLE IF EXISTS {load_schema}.{table_name}; ' \
                'CREATE TABLE {load_schema}.{table_name} ({columns});'.format(
                    load_schema=self.load_schema,
                    table_name=table_name,
                    columns=', '.join([self.get_column_def(x) for x in column_names])
                )
            self.cur.execute(create_table_sql)

            create_index_sql = \
                'CREATE INDEX {table_name}_{column_name}_idx ON {load_schema}.{table_name} ' \
                'USING btree ({column_name} ASC NULLS LAST) TABLESPACE pg_default;'.format(
                    column_name=column_names[0],
                    load_schema=self.load_schema,
                    table_name=table_name
                )
            self.cur.execute(create_index_sql)

            copy_csv_sql = 'COPY {load_schema}.{table_name} FROM STDIN DELIMITER \',\' CSV HEADER;'.format(
                load_schema=self.load_schema,
                table_name=table_name
            )
            with open(csv_path) as f:
                self.cur.copy_expert(copy_csv_sql, f)
            self.conn.commit()

    def process_area_type(self, area_type, path):
        csv_files = [
            x for x in os.listdir(path)
            if re.match(
                '2016Census_({codes})_{state}_{area_type}.csv'.format(
                    state=self.state,
                    codes='|'.join(self.table_codes),
                    area_type=area_type
                ),
                x
            )
        ]

        count = 1
        for csv_file in csv_files:
            print 'Processing CSV File {} ({}/{})'.format(csv_file, count, len(csv_files))
            csv_path = os.path.join(path, csv_file)
            self.process_csv_file(csv_path)
            count += 1

    def process_abs_data(self):
        for area_type in self.area_types:
            print 'Processing Area Type {}'.format(area_type)
            path = os.path.join(self.abs_data_path, area_type, self.state)
            self.process_area_type(area_type, path)


if __name__ == '__main__':
    abs_loader = AbsLoader(
        db_name='foss4g',
        db_user='workshop',
        db_password='workshop',
        db_host='ABC.XYZ.ap-southeast-2.rds.amazonaws.com',
        abs_data_path='../data/abs/2016_GCP_ALL_for_Vic_short-header/2016 Census GCP All Geographies for VIC',
        state='VIC',
        area_types=['SA1', 'SA2', 'SA3', 'SA4'],
        load_schema='abs',
        table_codes=['G01', 'G02']
    )
    abs_loader.process_abs_data()
