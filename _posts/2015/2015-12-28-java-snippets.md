---
layout: post
title: java code example
subtitle: 从我的大象笔记中导出的内容
---

## Tuple
```java
/**
 * 元组，不是蛋糕啊
 *
 * @author dewafer
 *
 */
public class Tuple<A, B> {

    public final A first;

    public final B second;

    public Tuple(A a, B b) {
        this.first = a;
        this.second = b;
    }

    public static <A, B> Tuple<A, B> of(A a, B b) {
        return new Tuple<A, B>(a, b);
    }

}
```

## dirty TestController
```java
/**
 * TODO 测试用页面
 *
 * @author user
 *
 */
@Controller
public class TestController implements ApplicationContextAware {

    ApplicationContext context;

    Connection connection;

    @RequestMapping("/test-api")
    public String index() {
        return "redirect:test-api.html";
    }

    @RequestMapping("/test-api.html")
    public ModelAndView index(HttpServletRequest request) throws SQLException {

        ModelAndView view = new ModelAndView();
        view.setViewName("/WEB-INF/jsp/test-api.jsp");
        view.addObject("allApis", getAllApis());
        view.addObject("allSession", getAllSessionIds());

        String sessionId = request.getParameter("sessionId");
        UserSession userSession = null;
        if (StringUtils.hasText(sessionId)) {
            RedisSessionComponent redisSession = (RedisSessionComponent) context.getBean(RedisSessionComponent.class);
            userSession = redisSession.getUserSession(sessionId);
            view.addObject("userSession", userSession);
        }

        view.addObject("apiFromDb", selectAllApiFromDB(sessionId, userSession));

        return view;
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.context = applicationContext;
    }

    @RequestMapping("/test-api/api-info.html")
    public ModelAndView info() {
        ModelAndView view = new ModelAndView();
        view.setViewName("/WEB-INF/jsp/api-info.jsp");
        view.addObject("allApis", getAllApis());
        // TODO api详细信息页面
        return view;
    }

    @RequestMapping("/test-api/copyfunrolerel.html")
    public ModelAndView cpyFunrolerel(HttpServletRequest request) throws SQLException {
        ModelAndView view = new ModelAndView("/WEB-INF/jsp/copyFunRoleRel.jsp");
        view.addObject("role-select", selectRoleFromDB());

        String selectedFromRoleId = request.getParameter("from-role-id");
        if (StringUtils.hasText(selectedFromRoleId)) {
            view.addObject("from-role-rel-table", selectFunctionRoleRelFromDB(selectedFromRoleId, null));
        }

        String selectedToRoleId = request.getParameter("to-role-id");
        if (StringUtils.hasText(selectedToRoleId)) {
            view.addObject("to-role-rel-table", selectFunctionRoleRelFromDB(selectedToRoleId, null));
        }

        return view;
    }

    @RequestMapping("/test-api/copyfunrolerel.html/copy")
    public String doCopy(@RequestParam("from-role-id") String fromRoleId, @RequestParam("to-role-id") String toRoleId)
            throws SQLException {

        String sql = "insert into t_up_rolefunctionrel(RoleId, FunctionID, RelationDesc, ValidStatus, Remark, CreateBy, UpdateBy )"
                + "SELECT '%2$s', FunctionID, RelationDesc, ValidStatus, Remark, CreateBy, UpdateBy "
                + "FROM t_up_rolefunctionrel where roleId = '%1$s' and functionid not in ( "
                + "select functionid from t_up_rolefunctionrel where roleid = '%2$s');";

        sql = String.format(sql, StringEscapeUtils.escapeSql(fromRoleId), StringEscapeUtils.escapeSql(toRoleId));

        getSqlRunner().insert(sql);

        return "redirect:../copyfunrolerel.html?from-role-id=" + fromRoleId + "&to-role-id=" + toRoleId
                + "&action-success=copy";
    }

    @RequestMapping("/test-api/functions.html")
    public ModelAndView api() throws SQLException {
        List<Map<String, String>> apis = getAllApis();
        List<Map<String, Object>> functions = selectAllApiFromDB(null, null);

        List<Map<String, Object>> apiAll = new ArrayList<Map<String, Object>>();
        for (Map<String, String> api : apis) {
            Map<String, Object> function = new HashMap<String, Object>();
            for (Map<String, Object> f : functions) {
                if (f.get("FUNCTIONFULLNAME").toString().equals(api.get("an"))) {
                    function = f;
                    break;
                }
            }
            function.putAll(api);
            apiAll.add(function);
        }

        for (Map<String, Object> function : functions) {
            boolean found = false;
            for (Map<String, Object> api : apiAll) {
                if (api.get("an").equals(function.get("FUNCTIONFULLNAME"))) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                function.put("an", function.get("FUNCTIONFULLNAME"));
                apiAll.add(function);
            }
        }

        ModelAndView view = new ModelAndView();
        view.setViewName("/WEB-INF/jsp/functions.jsp");
        view.addObject("api-table", apiAll);
        return view;
    }

    @RequestMapping(value = "/test-api/functions.html/update", method = RequestMethod.POST)
    public String updateApi(@RequestParam("fid") int functionId, @RequestParam("ffname") String functionFullName,
            @RequestParam("fdesc") String functionDesc, @RequestParam("flink") String functionLink,
            @RequestParam("ftype") String functionType, @RequestParam("fvalid") String functionValidStatus,
            @RequestParam(value = "api-filter", required = false) String apiFilter) throws SQLException {

        String sql = "update t_up_function set ";
        List<String> set = new ArrayList<String>();
        List<Object> params = new ArrayList<Object>();
        if (StringUtils.hasText(functionFullName)) {
            set.add("functionFullName = ? ");
            params.add(functionFullName);
        }
        if (StringUtils.hasText(functionDesc)) {
            set.add("functionDesc = ? ");
            params.add(functionDesc);
        }
        if (StringUtils.hasText(functionLink)) {
            set.add("functionLink = ? ");
            params.add(functionLink);
        }
        if (StringUtils.hasText(functionType)) {
            set.add("functionLinkType = ? ");
            params.add(functionType);
        }
        if (StringUtils.hasText(functionValidStatus)) {
            set.add("validStatus = ? ");
            params.add(functionValidStatus);
        }

        Iterator<String> iterator = set.iterator();
        while (iterator.hasNext()) {
            sql += iterator.next();
            if (iterator.hasNext()) {
                sql += " , ";
            }
        }

        sql += " where functionId = ?";
        params.add(functionId);

        getSqlRunner().update(sql, params.toArray());

        return "redirect:../functions.html?api-filter=" + apiFilter;
    }

    @RequestMapping(value = "/test-api/functions.html/insert", method = RequestMethod.POST)
    public String insertApi(@RequestParam(value = "fid", required = false) Integer functionId,
            @RequestParam("ffname") String functionFullName, @RequestParam("fdesc") String functionDesc,
            @RequestParam("flink") String functionLink, @RequestParam("ftype") String functionType,
            @RequestParam("fvalid") String functionValidStatus,
            @RequestParam(value = "api-filter", required = false) String apiFilter) throws SQLException {

        String sql = "insert into t_up_function  ";
        List<String> set = new ArrayList<String>();
        List<Object> params = new ArrayList<Object>();
        if (functionId != null) {
            set.add("functionId");
            params.add(functionId);
        } else {
            set.add("functionId");
            Map<String, Object> nextFunctionId = getSqlRunner().selectOne(
                    "Select (max(functionId) + 1) as nextFunctionId from t_up_function");
            params.add((long) nextFunctionId.get("NEXTFUNCTIONID"));
        }
        if (StringUtils.hasText(functionFullName)) {
            set.add("functionFullName");
            params.add(functionFullName);
        }
        if (StringUtils.hasText(functionDesc)) {
            set.add("functionDesc");
            params.add(functionDesc);
        }
        if (StringUtils.hasText(functionLink)) {
            set.add("functionLink");
            params.add(functionLink);
        }
        if (StringUtils.hasText(functionType)) {
            set.add("functionLinkType");
            params.add(functionType);
        }
        if (StringUtils.hasText(functionValidStatus)) {
            set.add("validStatus");
            params.add(functionValidStatus);
        }

        set.add("createBy");
        params.add(0);
        set.add("updateBy");
        params.add(0);
        set.add("ParentFunctionID");
        params.add(0);
        set.add("FunctionLevel");
        params.add(0);

        if (set.size() > 2) {

            sql += "(";
            Iterator<String> iterator = set.iterator();
            while (iterator.hasNext()) {
                sql += iterator.next();
                if (iterator.hasNext()) {
                    sql += " , ";
                }
            }
            sql += ")values(";
            iterator = set.iterator();
            while (iterator.hasNext()) {
                iterator.next();
                sql += "?";
                if (iterator.hasNext()) {
                    sql += " , ";
                }
            }
            sql += ")";

            getSqlRunner().insert(sql, params.toArray());
        }

        return "redirect:../functions.html?api-filter=" + apiFilter;
    }

    @RequestMapping(value = "/test-api/functions.html/delete", method = RequestMethod.POST)
    public String deleteApi(@RequestParam(value = "del_key") Integer functionId, @RequestParam(
            value = "api-filter", required = false) String apiFilter) throws SQLException {

        String sql = "delete from t_up_function where functionId = ?";
        getSqlRunner().delete(sql, functionId);

        return "redirect:../functions.html?api-filter=" + apiFilter;
    }

    @RequestMapping("/test-api/functionRoleRel.html")
    public ModelAndView funcRoleRel(@RequestParam(value = "role-id", required = false) String selectRoleId,
            @RequestParam(value = "func-name-filter", required = false) String funcNameFilter) throws SQLException {
        ModelAndView view = new ModelAndView();
        view.setViewName("/WEB-INF/jsp/functionRoleRel.jsp");
        view.addObject("rel-table", selectFunctionRoleRelFromDB(selectRoleId, funcNameFilter));
        view.addObject("role-select", selectRoleFromDB());
        if (StringUtils.hasText(selectRoleId)) {
            view.addObject("function-table", selectFunctionsFromDB(selectRoleId, funcNameFilter));
        }
        view.addObject("function-select", selectFunctionsFromDB(null, null));
        return view;
    }

    @RequestMapping(value = "/test-api/functionRoleRel.html/del", method = RequestMethod.POST)
    public String funcRoleRelDelete(@RequestParam("roleId") Integer roleId, @RequestParam("funcId") Integer funcId,
            @RequestParam(value = "func-name-filter", required = false) String funcNameFilter) throws SQLException {
        String sql = "DELETE FROM t_up_rolefunctionrel where roleId = ? and functionId = ?";
        getSqlRunner().delete(sql, roleId, funcId);
        return "redirect:../functionRoleRel.html?role-id=" + roleId + "&action-success=del"
                + (StringUtils.hasText(funcNameFilter) ? "&func-name-filter=" + funcNameFilter : "");
    }

    @RequestMapping(value = "/test-api/functionRoleRel.html/add", method = RequestMethod.POST)
    public String funcRoleRelAdd(@RequestParam("roleId") Integer roleId, @RequestParam("funcId") Integer funcId,
            @RequestParam(value = "func-name-filter", required = false) String funcNameFilter) throws SQLException {
        String sql = "INSERT INTO t_up_rolefunctionrel (RoleID, FunctionID, CreateBy, UpdateBy) VALUES (?, ?, 0, 0)";
        getSqlRunner().insert(sql, roleId, funcId);
        return "redirect:../functionRoleRel.html?role-id=" + roleId + "&action-success=add"
                + (StringUtils.hasText(funcNameFilter) ? "&func-name-filter=" + funcNameFilter : "");
    }

    /**
     * 所有session
     *
     * @return
     */
    private List<String> getAllSessionIds() {
        List<String> sessions = new ArrayList<String>();
        RedisTemplate redisTemplate = context.getBean(RedisTemplate.class);
        Set keys = redisTemplate.keys("USERTOKEN_*");
        for (Object k : keys) {
            sessions.add(k.toString().replaceAll("USERTOKEN_", ""));
        }
        return sessions;
    }

    /**
     * 程序中的所有api
     *
     * @return
     */
    private List<Map<String, String>> getAllApis() {
        RequestMappingHandlerMapping rmhp = context.getBean(RequestMappingHandlerMapping.class);
        Map<RequestMappingInfo, HandlerMethod> map = rmhp.getHandlerMethods();
        Iterator<RequestMappingInfo> iterator = map.keySet().iterator();

        List<Map<String, String>> allApis = new ArrayList<Map<String, String>>();

        while (iterator.hasNext()) {
            RequestMappingInfo info = iterator.next();
            HandlerMethod hm = map.get(info);
            ApiName apiName = hm.getMethodAnnotation(ApiName.class);
            String an = "";
            if (apiName != null) {
                an = apiName.value();
            }
            Iterator<String> patterns = info.getPatternsCondition().getPatterns().iterator();
            Iterator<RequestMethod> methods = info.getMethodsCondition().getMethods().iterator();
            while (patterns.hasNext()) {
                String apiUrl = patterns.next();
                String apiMethod = "";
                if (methods.hasNext()) {
                    do {
                        apiMethod += methods.next().name();
                        if (methods.hasNext()) {
                            apiMethod += " / ";
                        }
                    } while (methods.hasNext());
                } else {
                    apiMethod = "*";
                }

                Map<String, String> m = new HashMap<String, String>();
                m.put("an", an);
                m.put("apiUrl", apiUrl);
                m.put("apiMethod", apiMethod);
                m.put("apiClass", StringEscapeUtils.escapeHtml(hm.toString()));
                allApis.add(m);
            }

        }

        return allApis;
    }

    /**
     * DB中的所有api
     *
     * @param sessionId
     * @param userSession
     * @return
     * @throws SQLException
     */
    private List<Map<String, Object>> selectAllApiFromDB(String sessionId, UserSession userSession) throws SQLException {
        String sql = "select func.FunctionID as FunctionID, func.FunctionFullName as FunctionFullName, ";
        sql += " func.FunctionDesc as FunctionDesc, func.FunctionLink as FunctionLink, ";
        sql += " func.FunctionLinkType as FunctionLinkType, func.ValidStatus as ValidStatus, ";
        sql += " func_rel.ValidStatus as rolValid from t_up_function as func ";
        sql += " left join t_UP_RoleFunctionRel as func_rel on func_rel.FunctionID = func.FunctionID ";

        if (StringUtils.hasText(sessionId)) {
            sql += " left join t_UP_UserRoleRel as userRole on func_rel.RoleID = userRole.RoleID ";
            sql += " left join t_UP_role as role on (userRole.RoleID = role.RoleID and role.ValidStatus = 'Y') ";
            sql += " where userRole.UserId = " + userSession.getCurrentUserId();
        }

        return getSqlRunner().selectAll(sql);
    }

    /**
     * FunctionRoleRel表数据
     *
     * @param roleId
     * @param funcFilter
     * @return
     * @throws SQLException
     */
    private List<Map<String, Object>> selectFunctionRoleRelFromDB(String roleId, String funcFilter) throws SQLException {
        String sql = "select func_rel.RoleId ,role.RoleName ,role.RoleFullName ,role.OrgType ,"
                + "func_rel.FunctionID ,func.FunctionFullName ,func.FunctionDesc "
                + "from t_up_rolefunctionrel as func_rel left join t_up_role as role on (role.RoleId = func_rel.RoleId) "
                + "left join t_up_function as func on (func_rel.functionid = func.functionid) where 1=1 ";

        List<Object> params = new ArrayList<Object>();
        if (StringUtils.hasText(roleId)) {
            sql += "and func_rel.roleId = ? ";
            params.add(roleId);
        }
        if (StringUtils.hasText(funcFilter)) {
            sql += "and func.functionFullName like ? ";
            params.add("%" + funcFilter + "%");
        }

        return getSqlRunner().selectAll(sql, params.toArray());
    }

    /**
     * 角色表
     *
     * @return
     * @throws SQLException
     */
    private List<Map<String, Object>> selectRoleFromDB() throws SQLException {
        String sql = "select * from t_up_role";
        return getSqlRunner().selectAll(sql);
    }

    /**
     * 功能表
     *
     * @param roleId
     * @param funcFilter
     * @return
     * @throws SQLException
     */
    private List<Map<String, Object>> selectFunctionsFromDB(String roleId, String funcFilter) throws SQLException {
        String sql = "select * from t_up_function where 1=1 ";

        List<Object> params = new ArrayList<Object>();
        if (StringUtils.hasText(roleId)) {
            sql += "and functionId not in (select functionid from t_up_rolefunctionrel where roleid = ?) ";
            params.add(roleId);
        }
        if (StringUtils.hasText(funcFilter)) {
            sql += "and functionFullName like ? ";
            params.add("%" + funcFilter + "%");
        }

        return getSqlRunner().selectAll(sql, params.toArray());
    }

    private synchronized MySqlRunner getSqlRunner() throws SQLException {
        SqlSessionFactory sessionFactory = (SqlSessionFactory) context.getBean("sqlSessionFactory");
        if (connection == null || connection.isClosed()) {
            connection = sessionFactory.getConfiguration().getEnvironment().getDataSource().getConnection();
        }
        return new MySqlRunner(new SqlRunner(connection));
    }

    class MySqlRunner {

        SqlRunner runner;

        MySqlRunner(SqlRunner r) {
            this.runner = r;
        }

        public Map<String, Object> selectOne(String sql, Object... args) throws SQLException {
            return escapeValue(runner.selectOne(sql, args));
        }

        public List<Map<String, Object>> selectAll(String sql, Object... args) throws SQLException {
            return escapeValue(runner.selectAll(sql, args));
        }

        public int insert(String sql, Object... args) throws SQLException {
            return runner.insert(sql, args);
        }

        public int update(String sql, Object... args) throws SQLException {
            return runner.update(sql, args);
        }

        public int delete(String sql, Object... args) throws SQLException {
            return runner.delete(sql, args);
        }

        private List<Map<String, Object>> escapeValue(List<Map<String, Object>> list) {
            for (Map<String, Object> map : list) {
                escapeValue(map);
            }
            return list;
        }

        private Map<String, Object> escapeValue(Map<String, Object> map) {
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                if (entry.getValue() instanceof String) {
                    entry.setValue(StringEscapeUtils.escapeHtml(ObjectUtils.toString(entry.getValue())));
                }
            }
            return map;
        }

    }
}
```

## list to tree
```java
/**
 *
 *
 * @author dewafer
 *
 */
public abstract class List2TreeUtils {

    @SuppressWarnings("unchecked")
    public static <K, T, N extends Node<K, T>> N transform(Iterable<N> list) {

        N root = null;

        Map<K, List<N>> pidMap = new HashMap<K, List<N>>();
        for (N node : list) {
            List<N> childs = null;
            if (pidMap.containsKey(node.getId())) {
                childs = pidMap.get(node.getId());
            } else {
                childs = new ArrayList<N>();
                pidMap.put(node.getId(), childs);
            }
            node.setChilds((List<Node<K, T>>) childs);

            if (node.isRootNode()) {
                root = node;
            } else {
                List<N> sibbings = null;
                if (pidMap.containsKey(node.getParentId())) {
                    sibbings = pidMap.get(node.getParentId());
                } else {
                    sibbings = new ArrayList<N>();
                    pidMap.put(node.getParentId(), sibbings);
                }
                sibbings.add(node);
            }
        }
        return root;
    }

    public static abstract class Node<K, T> {

        private Collection<Node<K, T>> childs;

        public abstract K getId();

        public abstract K getParentId();

        public abstract boolean isRootNode();

        public abstract T getContent();

        public Collection<Node<K, T>> getChilds() {
            return childs;
        }

        public void setChilds(List<Node<K, T>> childs) {
            this.childs = childs;
        }

    }
}
```
