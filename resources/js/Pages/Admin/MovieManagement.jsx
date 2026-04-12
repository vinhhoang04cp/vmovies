import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieApi } from '@/Services/movieApi';
import { genreApi } from '@/Services/genreApi';
import { countryApi } from '@/Services/countryApi';
import { directorApi } from '@/Services/directorApi';
import { actorApi } from '@/Services/actorApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

export default function MovieManagement() {
    try {
        const {
            items: movies,
            loading,
            error,
            meta,
            page,
            search,
            sortBy,
            sortDir,
            setSearch,
            setPage,
            setSortBy,
            setSortDir,
            fetchItems,
            deleteItem,
            setError,
        } = useResourceManagement(movieApi);

    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [genres, setGenres] = useState([]);
    const [countries, setCountries] = useState([]);
    const [directors, setDirectors] = useState([]);
    const [actors, setActors] = useState([]);
    const [loadingLists, setLoadingLists] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        original_title: '',
        summary: '',
        release_year: new Date().getFullYear(),
        type: 'movie', // movie, series, special
        status: 'draft', // draft, published, archived
        poster: '',
        banner: '',
        trailer_url: '',
        genres: [],
        countries: [],
        directors: [],
        actors: [],
    });

    useEffect(() => {
        fetchItems(1);
        // eslint-disable-next-line
    }, [search, sortBy, sortDir]);

    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    // Helper: extract array from API response
    // apiClient returns { success, data: { success, data: { data: [...] } } }
    const extractArray = (res) => {
        if (!res?.success) return [];
        const d = res.data;
        // d = { success, data: { data: [...], meta }, message }
        if (Array.isArray(d?.data?.data)) return d.data.data;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    };

    // Load genres, countries, directors, actors khi mở modal
    const loadDropdownData = async () => {
        setLoadingLists(true);
        try {
            const [genresRes, countriesRes, directorsRes, actorsRes] = await Promise.all([
                genreApi.list({ per_page: 100 }),
                countryApi.list({ per_page: 100 }),
                directorApi.list({ per_page: 100 }),
                actorApi.list({ per_page: 100 }),
            ]);

            setGenres(extractArray(genresRes));
            setCountries(extractArray(countriesRes));
            setDirectors(extractArray(directorsRes));
            setActors(extractArray(actorsRes));
        } catch (err) {
            console.error('Error loading dropdown data:', err);
            setGenres([]);
            setCountries([]);
            setDirectors([]);
            setActors([]);
        } finally {
            setLoadingLists(false);
        }
    };

    const handleCreate = async () => {
        setEditingId(null);
        setFormData({
            title: '',
            original_title: '',
            summary: '',
            release_year: new Date().getFullYear(),
            type: 'movie',
            status: 'draft',
            poster: '',
            banner: '',
            trailer_url: '',
            genres: [],
            countries: [],
            directors: [],
            actors: [],
        });
        await loadDropdownData();
        setShowModal(true);
    };

    const handleEdit = async (movie) => {
        setEditingId(movie.id);
        setFormData({
            title: movie.title || '',
            original_title: movie.original_title || '',
            summary: movie.summary || '',
            release_year: movie.release_year || new Date().getFullYear(),
            type: movie.type || 'movie',
            status: movie.status || 'draft',
            poster: movie.poster || '',
            banner: movie.banner || '',
            trailer_url: movie.trailer_url || '',
            genres: movie.genres?.map((g) => g.id) || [],
            countries: movie.countries?.map((c) => c.id) || [],
            directors: movie.directors?.map((d) => d.id) || [],
            actors: movie.actors?.map((a) => a.id) || [],
        });
        await loadDropdownData();
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            setError('Tên phim không được để trống');
            return;
        }

        setFormLoading(true);
        try {
            const submitData = {
                title: formData.title,
                original_title: formData.original_title,
                summary: formData.summary,
                release_year: formData.release_year,
                type: formData.type,
                status: formData.status,
                poster: formData.poster,
                banner: formData.banner,
                trailer_url: formData.trailer_url,
            };

            let response;
            if (editingId) {
                response = await movieApi.update(editingId, submitData);
            } else {
                response = await movieApi.create(submitData);
            }

            if (response.success) {
                const movieId = editingId || response.data.id;

                // Attach genres
                if (formData.genres.length > 0) {
                    for (const genreId of formData.genres) {
                        await movieApi.attachGenre(movieId, genreId);
                    }
                }

                // Attach countries
                if (formData.countries.length > 0) {
                    for (const countryId of formData.countries) {
                        await movieApi.attachCountry(movieId, countryId);
                    }
                }

                // Attach directors
                if (formData.directors.length > 0) {
                    for (const directorId of formData.directors) {
                        await movieApi.attachDirector(movieId, directorId);
                    }
                }

                // Attach actors
                if (formData.actors.length > 0) {
                    for (const actorId of formData.actors) {
                        await movieApi.attachActor(movieId, actorId);
                    }
                }

                setToast({
                    message: editingId ? 'Cập nhật thành công!' : 'Tạo thành công!',
                    type: 'success',
                });
                setShowModal(false);
                await fetchItems(1);
            } else {
                setError(response.error || 'Lỗi khi lưu');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const success = await deleteItem(id);
        if (success) {
            setToast({ message: 'Xóa thành công!', type: 'success' });
        }
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        {
            key: 'title',
            label: 'Tên phim',
            sortable: true,
            render: (value, row) => (
                <div>
                    <div className="font-semibold">{value}</div>
                    <div className="text-sm text-gray-500">{row.original_title}</div>
                </div>
            ),
        },
        { key: 'type', label: 'Loại', sortable: true },
        { key: 'status', label: 'Trạng thái', sortable: true },
        { key: 'release_year', label: 'Năm', sortable: true },
        {
            key: 'view_count',
            label: 'Lượt xem',
            sortable: true,
            render: (value) => value || 0,
        },
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý phim</h1>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        + Thêm phim
                    </button>
                </div>

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {error && (
                    <Toast message={error} type="error" onClose={() => setError(null)} />
                )}

                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <input
                        type="text"
                        placeholder="Tìm kiếm phim..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={movies}
                                onSort={(col, dir) => {
                                    setSortBy(col);
                                    setSortDir(dir);
                                }}
                                sortBy={sortBy}
                                sortDir={sortDir}
                                rowAction={(row) => (
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => navigate(`/movies/${row.id}/episodes`)}
                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                                        >
                                            Tập phim
                                        </button>
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                                loading={loading}
                            />

                            {meta.last_page > 1 && (
                                <div className="p-4">
                                    <Pagination
                                        currentPage={page}
                                        lastPage={meta.last_page}
                                        total={meta.total}
                                        perPage={meta.per_page}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Form Modal */}
                <FormModal
                    isOpen={showModal}
                    title={editingId ? 'Sửa phim' : 'Tạo phim mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    {loadingLists ? (
                        <div className="p-8 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên phim *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tên phim"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên gốc
                                </label>
                                <input
                                    type="text"
                                    value={formData.original_title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, original_title: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Original title"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Loại phim *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) =>
                                            setFormData({ ...formData, type: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="movie">Phim lẻ</option>
                                        <option value="series">Series</option>
                                        <option value="special">Đặc biệt</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trạng thái *
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="draft">Nháp</option>
                                        <option value="published">Đã phát hành</option>
                                        <option value="archived">Lưu trữ</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Năm phát hành
                                </label>
                                <input
                                    type="number"
                                    value={formData.release_year}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            release_year: parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min={1900}
                                    max={new Date().getFullYear() + 1}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.summary}
                                    onChange={(e) =>
                                        setFormData({ ...formData, summary: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Mô tả nội dung phim..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thể loại
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                                    {genres.map((genre) => (
                                        <label key={genre.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.genres.includes(genre.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            genres: [...formData.genres, genre.id],
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            genres: formData.genres.filter(
                                                                (id) => id !== genre.id
                                                            ),
                                                        });
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{genre.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quốc gia
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                                    {countries.map((country) => (
                                        <label key={country.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.countries.includes(country.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            countries: [
                                                                ...formData.countries,
                                                                country.id,
                                                            ],
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            countries: formData.countries.filter(
                                                                (id) => id !== country.id
                                                            ),
                                                        });
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{country.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Đạo diễn
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                                    {directors.map((director) => (
                                        <label key={director.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.directors.includes(director.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            directors: [
                                                                ...formData.directors,
                                                                director.id,
                                                            ],
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            directors: formData.directors.filter(
                                                                (id) => id !== director.id
                                                            ),
                                                        });
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{director.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Diễn viên
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                                    {actors.map((actor) => (
                                        <label key={actor.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.actors.includes(actor.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            actors: [
                                                                ...formData.actors,
                                                                actor.id,
                                                            ],
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            actors: formData.actors.filter(
                                                                (id) => id !== actor.id
                                                            ),
                                                        });
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{actor.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Poster
                                </label>
                                <input
                                    type="url"
                                    value={formData.poster}
                                    onChange={(e) =>
                                        setFormData({ ...formData, poster: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Banner
                                </label>
                                <input
                                    type="url"
                                    value={formData.banner}
                                    onChange={(e) =>
                                        setFormData({ ...formData, banner: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Trailer
                                </label>
                                <input
                                    type="url"
                                    value={formData.trailer_url}
                                    onChange={(e) =>
                                        setFormData({ ...formData, trailer_url: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </>
                    )}
                </FormModal>
            </div>
        </div>
    );
    } catch (err) {
        console.error('MovieManagement Error:', err);
        return (
            <div className="p-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Error: {err.message}</p>
                </div>
            </div>
        );
    }
}

