import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Blanket } from '../../types/models';
import { blanketService } from '../../services/blanketService';
import '../Distributors/DistributorForm.css';

export default function BlanketForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Omit<Blanket, 'blanketId'>>({
        modelName: '',
        material: '',
        stockLevel: 0,
        productionCapacity: 0,
        size: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            loadBlanket(parseInt(id));
        }
    }, [id, isEdit]);

    const loadBlanket = async (blanketId: number) => {
        try {
            const data = await blanketService.getById(blanketId);
            setFormData({
                modelName: data.modelName,
                material: data.material,
                stockLevel: data.stockLevel,
                productionCapacity: data.productionCapacity,
                size: data.size,
            });
        } catch (err) {
            setError('Failed to load blanket');
            console.error(err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEdit && id) {
                await blanketService.update(parseInt(id), {
                    ...formData,
                    blanketId: parseInt(id),
                });
            } else {
                await blanketService.create(formData);
            }
            navigate('/blankets');
        } catch (err) {
            setError('Failed to save blanket. Make sure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>{isEdit ? 'Edit Blanket' : 'Add New Blanket'}</h2>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="modelName">Model Name *</label>
                    <input
                        type="text"
                        id="modelName"
                        name="modelName"
                        value={formData.modelName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="material">Material *</label>
                    <input
                        type="text"
                        id="material"
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="stockLevel">Stock Level *</label>
                    <input
                        type="number"
                        id="stockLevel"
                        name="stockLevel"
                        value={formData.stockLevel}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="productionCapacity">Production Capacity *</label>
                    <input
                        type="number"
                        id="productionCapacity"
                        name="productionCapacity"
                        value={formData.productionCapacity}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                    </button>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate('/blankets')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
