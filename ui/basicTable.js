var BasicTable = function (tableDivName, columns, options) {
	options = options || {};
	
	var refreshListeners = [];
	var selectListeners = [];
	var that = this;
	var dataMap = {};
	var hoverListeners = [];
	var rawTableName = tableDivName + 'Widget';
	var tableName = '#' + rawTableName;
	$("#" + tableDivName).removeClass();
	var innerHTML = '<table cellpadding="0" cellspacing="0" border="0" class="display" id="' + rawTableName + '">\
		<thead>\
			<tr>';
	columns.forEach(function (col) {
		
		innerHTML += "<th>" + col + "</th>";
	});

//	if (options.deletable) {
		innerHTML += "<th></th>";
//	}
	
	innerHTML += '		</tr>\
		</thead>\
	</table>';
	$('#' + tableDivName).html(innerHTML);
	
	var oTable = null;
	this.oTable = oTable;
	
	var deleteCallback = function(oSettings) {
		if (options.deletable) {
			$(tableName + ' .rowDeleter').off('click');
			$(tableName + ' .rowDeleter').click(function(a) {
				// alert('this is a ' + a);
				var tr = $(this).parents('tr');
			    var rowData = that.getRow(tr);
			    if (rowData) {
	                var id = that.getObjectId(rowData);
	                delete dataMap[id];
			    }
				 oTable
			        .row( tr )
			        .remove()
			        .draw();
				 
//				var aPos = oTable.fnGetPosition(tr);
//				oTable.fnDeleteRow(aPos);
				fireEvent(refreshListeners);
			});
		}
	}; 
	
	var initialise = function () {
	    TableTools.DEFAULTS.sSwfPath = "/swf/copy_csv_xls_pdf.swf";
		
		var colDefs = [];
		
		
//		colDefs.push({
//			'bSortable' : false,
//			'aTargets' : [ '_all' ]
//		});
		if (options.deletable) {
			colDefs.push({
				'bSortable' : false,
				'aTargets' : [ -1 ],  // last row
				"mRender" : function(oObj, type, full) {
					return '<a href="#" class="rowDeleter" id="table_delete_'
						+ oObj[0] + '" ><img width="22" height="20" src="/images/delete.png" alt="Delete"></a>';
				}
			});
		}
		else {
			colDefs.push({
				'bSortable' : false,
				'aTargets' : [ -1 ],  // last row
				"bVisible" : false
			});
		}
		if (options.customColDefs) {
			colDefs = colDefs.concat(options.customColDefs);
		}
		var args = {
				"aoColumnDefs" : colDefs,
//				"sDom" : 'tp'
			};
		if (options.deletable) {
			args["fnDrawCallback"] = deleteCallback; 
		}
		if (options.searchable) {
			args["oLanguage"] = {
				"sSearch": "Search all columns:"
			};
		}
		
		if (options.exportable) {
			args["dom"] = 'T<"clear">lfrtip';
			args['tableTools'] = {
		            "sSwfPath": "/swf/copy_csv_xls_pdf.swf"
		        };
		}
		args.fnRowCallback = options.fnRowCallback;
		
		args["fnCreatedRow"] = function( nRow, aData, iDataIndex ) {
        $(nRow).attr('id', aData[0]);
    };
    
		oTable = $(tableName)
		.DataTable(args);
		TableTools.DEFAULTS.sSwfPath = "/swf/copy_csv_xls_pdf.swf";
        if (options.selectable) {
    		$(tableName + " tbody")
		        .on('click', 'tr', 
		                function(e) {
        					if ($(this).hasClass('row_selected')) {
        						$(this).removeClass('row_selected');
        					} else {
        						oTable.$('tr.row_selected')
        								.removeClass('row_selected');
        						$(this).addClass('row_selected');
        					}
        					fireEvent(selectListeners);
        				});
        }
		return oTable;

	}
    if (options.hoverable) {
//      $('#' + tableDivName + ' tbody').unbind('mouseover')
        $(tableName)
        .on('mouseover', 'tr', function() {
            that.fireHover(that.getRow(this));
        })

    }
	
	
	this.addRefreshListener = function (listener) {
		refreshListeners.push(listener);
	};
	
	this.addSelectListener = function (listener) {
		selectListeners.push(listener);
	};

	this.addHoverListener = function (listener) {
        hoverListeners.push(listener);
    };
	
	this.clear = function() {
		oTable.clear();
		this.refresh();
        fireEvent(refreshListeners);
	};
	
	this.adjustSize = function () {
	   $(oTable).css({ width: $(oTable).parent().width() });
	    oTable.fnAdjustColumnSizing();  
	};

	this.getRow = function(tr) {
		var index = oTable.row(tr).index();
		var ret = null;
		if (typeof index !== 'undefined') {
		    
    		var row = oTable.row(index).data();
    		var id = row[row.length - 1];
    		ret = dataMap[id];
        }
		return ret;
	};

	this.getObjectId = function(obj) {
		return obj.id();
	};

	this.addAll = function (arr) {
		arr.forEach (function (obj) {
			that.add(obj);
		});
		this.refresh();
	};

	/**
	 * @param {Object} range
	 */
	this.add = function (obj) {
		var row = this.createRow(obj);
		var id = this.getObjectId(obj);
		row.push(id);
		dataMap[id] = obj;

		var addId = oTable.row.add(row);

//		var theNode = oTable.fnSettings().aoData[addId[0]].nTr;
//		theNode.setAttribute('id',tableDivName + "_" + id);
	};
	
	

	this.createRow = function(row) {
		console.log('IMPLEMENT createRow');
	};

	this.createObject = function(row) {
		return dataMap[row[columns.length]];
	};

	this.refresh = function () {
		oTable.draw();
	}

    this.fireHover = function (dataItem) {
        hoverListeners.forEach(function (listener) {
            listener(dataItem);
        })
    }

	this.getRows = function() {
		var rows = oTable.rows().data();
		var objs = [];
		for ( var i = 0; i < rows.length; i++) {
			var obj = this.createObject(rows[i]);
			objs.push(obj);
		}
		return objs;
	};
	
	/* Get the rows which are currently selected */
	this.getSelected = function() {
		var selected = oTable.$('tr.row_selected');
		return selected.length > 0 ? this.createObject(oTable.fnGetData(selected.get(0)))
				: null;
	};

	this.hasData = function () {
		var rows = oTable.rows();

		return  (rows.length > 0);
	};

	var fireEvent = function (listeners) {
		var selected = that.getSelected();
		listeners.forEach (function (listener) {
			listener(selected);
		});
	};
	

	initialise();
};

module.exports = BasicTable;