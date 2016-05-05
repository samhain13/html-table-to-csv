/*
    s13core table editor
*/
table_editor = {
    'columns': [],
    'contents_field': null,
    'rows': [],
    'separator': null,
    'table': null,
    
    'init': function(table_id, contents_field_id, delimiter_field_id) {
        this.contents_field = document.getElementById(contents_field_id);
        this.delimiter = document.getElementById(delimiter_field_id);
        this.table = document.getElementById(table_id);
        this.draw_table();
    },
    
    'change_delimiter': function() {
        var s = this.delimiter.value;
        if (s.length < 1 || s.length > 8) {
            alert('The delimiter must be between 1 and 8 characters long.');
            this.delimiter.value = '|';  // Set a sensible default.
        } else {
            this.delimiter.value = s;
        }
        this.compose_contents();
    },
    
    'compose_contents': function() {
        var d = this.delimiter.value;
        var s = this.columns.join(d);
        for (var i=0; i<this.rows.length; i++) {
            var row_array = [];
            for (var j=0; j<this.columns.length; j++) {
                var value = this.rows[i][this.columns[j]];
                if (value == undefined || value == null) value = '';
                row_array.push(value);
            }
            s += '\n' + row_array.join(d);
        }
        this.contents_field.value = s;
    },
    
    'draw_table': function() {
        this.table.innerHTML = '';  // Reset the visualisation.
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');
        // Compose the table header.
        var thead_tr = document.createElement('tr');
        for (var i=0; i<this.columns.length + 1; i++) {
            var td = document.createElement('td');
            var a = document.createElement('a');
            if (i < this.columns.length) {
                var s = document.createElement('span');
                a.appendChild(document.createTextNode(' [x]'));
                a.setAttribute('onclick', 'table_editor.remove_column(' +i+ ');');
                a.setAttribute('title', 'Remove Column');
                s.appendChild(document.createTextNode(this.columns[i]));
                s.setAttribute('onclick', 'table_editor.edit_column(' +i+ ');');
                td.appendChild(s);
            } else {
                a.appendChild(document.createTextNode('[+]'));
                a.setAttribute('onclick', 'table_editor.make_column();');
                a.setAttribute('title', 'Add Column');
            }
            td.appendChild(a);
            thead_tr.appendChild(td);
        }
        // Compose the table body.
        for (var i=0; i<this.rows.length + 1; i++) {
            var tr = document.createElement('tr');
            for (var j=0; j<this.columns.length+1; j++) {
                var td = document.createElement('td');
                var s = document.createElement('span');
                if (i < this.rows.length) {
                    if (j < this.columns.length) {
                        var value = this.rows[i][this.columns[j]];
                        if (value == undefined || value == null || value == "") {
                            value = '[Set Value]';
                            this.rows[i][this.columns[j]] = null;
                            td.setAttribute('class', 'grey-out');
                        }
                        s.setAttribute('onclick', 'table_editor.edit_row(' +i+ ', ' +j+ ');');
                    } else {
                        var value = '[x]';
                        s.setAttribute('onclick', 'table_editor.remove_row(' +i+ ');');
                        s.setAttribute('title', 'Remove Row');
                        td.setAttribute('class', 'grey-out');
                    }
                } else {
                    if (j < this.columns.length) {
                        var value = '[Add value]';
                        s.setAttribute('onclick', 'table_editor.make_row(' +j+ ');');
                    } else {
                        var value = '';
                    }
                    td.setAttribute('class', 'grey-out');
                }
                s.appendChild(document.createTextNode(value));
                td.appendChild(s);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        // Put them all together.
        thead.appendChild(thead_tr);
        this.table.appendChild(thead);
        this.table.appendChild(tbody);
        // Put it in the contents field.
        this.compose_contents();
    },
    
    'edit_column': function(col) {
        var old_c = this.columns[col].valueOf();
        var value = prompt('Modify column name:', this.columns[col]);
        if (value.length > 0) {
            this.columns[col] = value;
            for (var i=0; i<this.rows.length; i++) {
                var r = this.rows[i];
                var old_r = r[old_c].valueOf();
                r[value] = old_r;  // Save the new key containing the existing value.
                delete(r[old_c]);  // Remove the old key.
            }
            this.draw_table();
        } else {
            alert('Column names must have at least one character.');
        }
    },
    
    'edit_row': function(row, col) {
        var r = this.rows[row];
        var c = this.columns[col];
        // We need a null value explicitly because we're checking for null-ness elsewhere.
        if (value = prompt('Modify value of ' + c + ':', (r[c]) ? r[c] : '')) r[c] = value;
        else r[c] = null;
        this.draw_table();
    },
    
    'make_column': function() {
        var value = prompt('New column name:')
        if (value.length > 0) {
            this.columns.push(value);
            this.draw_table();
        } else {
            alert('Column names must have at least one character.');
        }
    },
    
    'make_row': function(col) {
        var c = this.columns[col];
        if (value = prompt('New value for ' + c + ':')) {
            var r = {};
            for (var i=0; i<this.columns.length; i++) {
                if (i == col) r[c] = value;
                else r[this.columns[i]] = null;
            }
            this.rows.push(r);
            this.draw_table();
        }
    },
    
    'parse_to_table': function() {
        this.rows = [];  // Reset the rows.
        var d = this.delimiter.value;
        var lines = this.contents_field.value.split('\n');
        for (var i=0; i<lines.length; i++) {
            var line_values = lines[i].split(d);
            // The column names are on the first line.
            if (i == 0) {
                this.columns = line_values;
            // Every other line contains celldata.
            } else {
                var row = {};
                for (var j=0; j<this.columns.length; j++) {
                    var col = this.columns[j];
                    if (j < line_values.length) row[col] = line_values[j];
                }
                this.rows.push(row);
            }
        }
        this.draw_table();
    },
    
    'remove_column': function(col) {
        var c = this.columns[col].valueOf();
        if (confirm('Remove column\n"' +c+ '"?')) {
            this.columns.splice(col, 1);
            for (var i=0; i<this.rows.length; i++) {
                delete(this.rows[i][c]);
            }
            this.draw_table();
        }
    },
    
    'remove_row': function(row) {
        this.rows.splice(row, 1);
        this.draw_table();
    }
};
