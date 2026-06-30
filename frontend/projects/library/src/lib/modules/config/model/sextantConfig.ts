export interface SextantConfig {
  facetConfig: SextantLegacyFacet[];
  tabOverflow?: {
    search?: boolean;
    map?: boolean;
  };
}

export interface SextantLegacyFacet {
  // key correspond à la clé de la facette.
  key?: string;
  // Si le champ est multilingue, on spécifie pour chaque langue la clé de la facette avec la propriété langs.
  langs?: Record<string, string>;
  // tree indique une facette arborescente, la facette doit retourner des résultat sous forme A/AA/AAA
  // DEPRECATED tree?: boolean;
  labels?: Record<string, string>;
  // opened indique si une facet doit être ouverte (dépliée) au chargement de l'application (optionnel)
  opened?: boolean;
  // orderBy indique si une facet doit voir son contenu ordonné, valeur par défaut => par nombre d'occurence, alphabetical pour les afficher par ordre alphabétique.
  orderBy?: string;
  // thesaurusKey: si l'aggrégation est faite sur un thésaurus en mode multilingue (eg. th_NVS-OD1_tree.key) que le nom du fichier du thésaurus contient des caractères non utilisables pour un champ dans Elasticsearch (eg. NVS.OD1), utiliser cette propriété pour configurer le nom du thésaurus (eg. NVS.OD1) qui permet de charger les traductions
  thesaurusKey?: string;
  // filter indique si on ajoute un filtre sur la facette.
  filter?: boolean;
  // include permet de filter les valeurs apparaissant dans la facette; spécifier une expression régulière (par exemple service_.*); pour des valeurs distinctes, utiliser valeur1|valeur2|valeur3
  include?: string;
  // exclude: similaire à include mais permettant d'exclure des valeurs; prioritaire
  exclude?: string;

  terms?: Record<string, unknown>;
  gnBuildFilterForRange?: Record<string, unknown>;
  filters?: Record<string, unknown>;
}
