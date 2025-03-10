import React, { useState, useEffect } from 'react';
import './ContainerInfoTable.css';

const ContainerInfoTable = ({ containerData }) => {
  const [editableData, setEditableData] = useState({
    owner: containerData.owner ? (Array.isArray(containerData.owner) ? containerData.owner[0] : containerData.owner) : '',
    type: containerData.type ? (Array.isArray(containerData.type) ? containerData.type[0] : containerData.type) : '',
    id: containerData.id ? (Array.isArray(containerData.id) ? containerData.id[0] : containerData.id) : '',
    verifier: containerData.verifier ? (Array.isArray(containerData.verifier) ? containerData.verifier[0] : containerData.verifier) : '',
    isoType: containerData.isoType ? (Array.isArray(containerData.isoType) ? containerData.isoType[0] : containerData.isoType) : ''
  });

  const [editingField, setEditingField] = useState(null);
  const [customValues, setCustomValues] = useState({});
  const [originalData, setOriginalData] = useState({});

  const [options, setOptions] = useState({
    owner: [],
    type: [],
    id: [],
    verifier: [],
    isoType: []
  });

  useEffect(() => {
    setEditableData({
      owner: containerData.owner ? (Array.isArray(containerData.owner) ? containerData.owner[0] : containerData.owner) : '',
      type: containerData.type ? (Array.isArray(containerData.type) ? containerData.type[0] : containerData.type) : '',
      id: containerData.id ? (Array.isArray(containerData.id) ? containerData.id[0] : containerData.id) : '',
      verifier: containerData.verifier ? (Array.isArray(containerData.verifier) ? containerData.verifier[0] : containerData.verifier) : '',
      isoType: containerData.isoType ? (Array.isArray(containerData.isoType) ? containerData.isoType[0] : containerData.isoType) : ''
    });

    setOptions({
      owner: Array.isArray(containerData.owner) ? containerData.owner : (containerData.owner ? [containerData.owner] : []),
      type: Array.isArray(containerData.type) ? containerData.type : (containerData.type ? [containerData.type] : []),
      id: Array.isArray(containerData.id) ? containerData.id : (containerData.id ? [containerData.id] : []),
      verifier: Array.isArray(containerData.verifier) ? containerData.verifier : (containerData.verifier ? [containerData.verifier] : []),
      isoType: Array.isArray(containerData.isoType) ? containerData.isoType : (containerData.isoType ? [containerData.isoType] : [])
    });
  }, [containerData]);

  const startEditing = (field) => {
    setOriginalData({ ...editableData });
    setEditingField(field);
  };

  const saveEdit = () => {
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditableData({ ...originalData });
    setEditingField(null);
  };

  const handleInputChange = (field, value) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomInputChange = (field, value) => {
    setCustomValues(prev => ({ ...prev, [field]: value }));
    setEditableData(prev => ({ ...prev, [field]: value }));
  };

  const renderCell = (field, label) => {
    const isEditing = editingField === field;
    const fieldOptions = options[field];
    const hasMultipleOptions = fieldOptions.length > 1;

    return (
      <tr key={field}>
        <td>{label}</td>
        <td>
          {isEditing ? (
            <div className="editing-controls">
              {/* Primera línea: Dropdown y campo de texto */}
              <div className="input-group">
                {hasMultipleOptions && (
                  <select
                    value={editableData[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="options-dropdown"
                  >
                    <option value="">Seleccionar...</option>
                    {fieldOptions.map((option, idx) => (
                      <option key={idx} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  value={customValues[field] || editableData[field] || ''}
                  onChange={(e) => handleCustomInputChange(field, e.target.value)}
                  placeholder="Escribir valor..."
                  className="custom-input"
                />
              </div>

              {/* Segunda línea: Botones */}
              <div className="button-group">
                <button onClick={saveEdit} className="save-button">Guardar</button>
                <button onClick={cancelEdit} className="cancel-button">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="display-value">
              <span className="value-text">{editableData[field]}</span>
              <button onClick={() => startEditing(field)} className="edit-button">Editar</button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="container-info-table">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {renderCell('owner', 'Propietario del contenedor')}
          {renderCell('type', 'Tipo de contenedor')}
          {renderCell('id', 'ID')}
          {renderCell('verifier', 'Verificador')}
          {renderCell('isoType', 'Tipo ISO del contenedor')}
        </tbody>
      </table>
    </div>
  );
};

export default ContainerInfoTable;